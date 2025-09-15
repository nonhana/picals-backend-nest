import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { In, Repository } from 'typeorm';
import { Illustration } from '../illustration/entities/illustration.entity';
import { REDIS_CLIENT } from '@/infra/redis/redis.module';
import { Like } from 'typeorm';
import { shuffleArray } from '@/utils/shuffleArray';
import { Redis } from 'ioredis';

// 生成随机的hex颜色
const randomColor = () => {
	return `#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padStart(6, '0')}`;
};

@Injectable()
export class LabelService {
	@Inject(REDIS_CLIENT)
	private readonly redisClient: Redis;

	@InjectRepository(Label)
	private readonly labelRepository: Repository<Label>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	// 根据id查找标签
	async findItemById(id: string) {
		return await this.labelRepository.findOne({ where: { id } });
	}

	// 根据value查找标签
	async findItemByValue(value: string) {
		const label = await this.labelRepository.findOne({ where: { value } });
		if (!label) return null;
		return label;
	}

	// 创建标签
	async createItem(value: string) {
		const existedLabel = await this.findItemByValue(value);
		if (existedLabel) return existedLabel;
		const item = this.labelRepository.create({ value, color: randomColor() });
		return await this.labelRepository.save(item);
	}

	// 批量创建标签
	async createItems(values: string[]) {
		return await Promise.all(values.map(async (value) => await this.createItem(value)));
	}

	// 获取某个作品的标签列表
	async getItemsByIllustrationId(id: string) {
		return await this.labelRepository
			.createQueryBuilder('label')
			.leftJoin('label.illustrations', 'illustration')
			.where('illustration.id = :id', { id })
			.getMany();
	}

	// 搜索标签
	async searchLabels(keyword: string) {
		return await this.labelRepository.find({
			where: { value: Like(`%${keyword}%`) },
		});
	}

	// 获取推荐标签列表
	async getRecommendLabels() {
		const allIdsCacheKey = 'labels:all-ids';
		const cacheTTL = 60 * 10;

		let allLabelIds: string[] = JSON.parse(await this.redisClient.get(allIdsCacheKey)) || null;

		if (!allLabelIds) {
			const labelsResult = await this.labelRepository
				.createQueryBuilder('label')
				.select('label.id', 'id')
				.getRawMany<{ id: string }>();

			allLabelIds = labelsResult.map((item) => item.id);

			await this.redisClient.set(allIdsCacheKey, JSON.stringify(allLabelIds), 'EX', cacheTTL);
		}

		const shuffledIds = shuffleArray(allLabelIds);
		const targetLength = 30;
		const randomIds = shuffledIds.splice(0, targetLength);

		if (randomIds.length === 0) {
			return [];
		}

		const labels = await this.labelRepository.findBy({ id: In(randomIds) });

		const labelsMap = new Map(labels.map((label) => [label.id, label] as [string, Label]));
		const sortedLabels = randomIds.map((id) => labelsMap.get(id));

		return sortedLabels;
	}

	// 分页获取带有该标签的作品列表
	async getWorksByLabelInPages(labelId: string, pageSize: number, current: number) {
		const label = new Label();
		label.id = labelId;

		return await this.illustrationRepository
			.createQueryBuilder('illustration')
			.leftJoinAndSelect('illustration.labels', 'label')
			.where('label.id = :labelId', { labelId })
			.skip((current - 1) * pageSize)
			.take(pageSize)
			.getMany();
	}

	// 分页获取标签列表
	async getLabelsInPages(pageSize: number, current: number) {
		return await this.labelRepository.find({
			skip: (current - 1) * pageSize,
			take: pageSize,
		});
	}

	// 增加标签的作品数
	async increaseWorkCount(value: string) {
		const label = await this.findItemByValue(value);
		label.workCount += 1;
		return await this.labelRepository.save(label);
	}

	// 减少标签的作品数
	async decreaseWorkCount(value: string) {
		const label = await this.findItemByValue(value);
		label.workCount -= 1;
		return await this.labelRepository.save(label);
	}
}
