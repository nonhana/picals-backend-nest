// /src/user/entities/user.entity.ts
// 用户实体

import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { Label } from '@/modules/label/entities/label.entity';
import { Comment } from '@/modules/comment/entities/comment.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';
import { History } from '@/modules/history/entities/history.entity';
import { Favorite } from '@/modules/favorite/entities/favorite.entity';
import { WorkPushTemp } from '@/modules/illustration/entities/work-push-temp.entity';
import { LikeWorks } from './like-works.entity';
import { Follow } from './follow.entity';

@Entity({
	name: 'users',
})
export class User {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '用户id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 31,
		comment: '用户名',
		default: '一只小萌新',
	})
	username: string;

	@Column({
		type: 'varchar',
		length: 125,
		comment: '用户邮箱',
	})
	email: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '用户密码',
	})
	password: string;

	@Column({
		type: 'varchar',
		length: 127,
		comment: '用户背景图片URL地址',
		name: 'background_img',
		nullable: true,
	})
	backgroundImg: string;

	@Column({
		type: 'varchar',
		length: 127,
		comment: '用户头像图片URL地址',
		default: 'https://moe.nonhana.pics/images/image-1718290795662-173119738-default-avatar.jpg',
	})
	avatar: string;

	@Column({
		type: 'varchar',
		length: 127,
		comment: '用户小头像图片URL地址',
		name: 'little_avatar',
		default: 'https://moe.nonhana.pics/images/image-1718290795662-173119738-default-avatar.jpg',
	})
	littleAvatar: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '用户签名',
		default: '请多多指教！~',
	})
	signature: string;

	@Column({
		type: 'tinyint',
		comment: '用户性别，0-男，1-女，2-未知',
		default: 2,
	})
	gender: number;

	@Column({
		type: 'int',
		comment: '用户粉丝数',
		name: 'fan_count',
		default: 0,
	})
	fanCount: number;

	@Column({
		type: 'int',
		comment: '用户关注数',
		name: 'follow_count',
		default: 0,
	})
	followCount: number;

	@Column({
		type: 'int',
		comment: '用户原创作品数',
		name: 'origin_count',
		default: 0,
	})
	originCount: number;

	@Column({
		type: 'int',
		comment: '用户转载作品数',
		name: 'reprinted_count',
		default: 0,
	})
	reprintedCount: number;

	@Column({
		type: 'int',
		comment: '用户喜欢作品数',
		name: 'like_count',
		default: 0,
	})
	likeCount: number;

	@Column({
		type: 'int',
		comment: '用户收藏作品数',
		name: 'collect_count',
		default: 0,
	})
	collectCount: number;

	@Column({
		type: 'int',
		comment: '用户收藏夹数',
		name: 'favorite_count',
		default: 0,
	})
	favoriteCount: number;

	@Column({
		type: 'boolean',
		comment: '用户状态，0-正常，1-删除',
		name: 'status',
		default: 0,
	})
	status: number;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '用户创建时间',
		name: 'created_time',
	})
	createdTime: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		comment: '用户更新时间',
		name: 'updated_time',
	})
	updatedTime: Date;

	@OneToMany(() => Follow, (follow) => follow.follower)
	following: User[];

	@OneToMany(() => Follow, (follow) => follow.following)
	followers: User[];

	@OneToMany(() => Illustration, (illustration) => illustration.user)
	illustrations: Illustration[];

	@ManyToMany(() => Label, (label) => label.users, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	likedLabels: Label[];

	@OneToMany(() => LikeWorks, (likeWorks) => likeWorks.user)
	likeWorks: LikeWorks[];

	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];

	@OneToMany(() => History, (history) => history.user)
	histories: History[];

	@OneToMany(() => Favorite, (favorite) => favorite.user)
	favorites: Favorite[];

	@OneToMany(() => WorkPushTemp, (workTemp) => workTemp.user)
	recordWorks: WorkPushTemp[];
}
