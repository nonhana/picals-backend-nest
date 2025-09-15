import { Global, Inject, Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const redisProvider: Provider<RedisClient> = {
	provide: REDIS_CLIENT,
	useFactory: async (configService: ConfigService) => {
		const client = new Redis({
			host: configService.get<string>('REDIS_HOST'),
			port: configService.get<number>('REDIS_PORT'),
			db: configService.get<number>('REDIS_DB'),
			password: configService.get<string>('REDIS_PASS'),
		});

		client.on('error', (err) => {
			console.error('Redis Client Error', err);
		});

		console.log('Redis client connected successfully.');
		return client;
	},
	inject: [ConfigService],
};

@Global()
@Module({
	providers: [redisProvider],
	exports: [redisProvider],
})
export class RedisModule implements OnModuleDestroy {
	@Inject(REDIS_CLIENT)
	private readonly redisClient: RedisClient;

	onModuleDestroy() {
		this.redisClient.quit();
		console.log('Redis client disconnected.');
	}
}
