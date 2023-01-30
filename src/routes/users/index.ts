import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
// import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });
      if (user) return user;
      reply.statusCode = 404;
      throw new Error;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await fastify.db.users.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const posts = await fastify.db.posts.findMany();  
      // const profile = await fastify.db.profiles.findOne({ key: 'id', equals: request.params.id });
      const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: request.params.id });
      const users = await fastify.db.users.findMany();
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });
      // const subscribedToUserIds = user?.subscribedToUserIds;

      if (typeof request.params.id !== 'string' || user === null) {
        reply.statusCode = 400;
        throw new Error('id error');
      }
      if (!user) {
        reply.statusCode = 404;
        throw new Error('user error');
      }
      if (!posts ) {
        reply.statusCode = 404;
        throw new Error('post error');
      }
      posts.forEach(async item => {
        if (item.userId === user.id) {
          await fastify.db.posts.delete(item.id);
        }
      });
      profiles.forEach(async item => {
        await fastify.db.profiles.delete(item.id);
      });     
    
      users.forEach(async (item, index) => {
        const booleanNumber = item.subscribedToUserIds.indexOf(request.params.id);
        if (booleanNumber >= 0) {
          const indexSubscribed = item.subscribedToUserIds.indexOf(request.params.id)
          item.subscribedToUserIds.splice(indexSubscribed, 1);
          await fastify.db.users.change(item.id, item);
        }                
      });
      return await fastify.db.users.delete(request.params.id);   
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.body.userId });
      const userId = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });
      if (typeof request.params.id !== 'string') {
        reply.statusCode = 400;
        throw new Error(`this is here`);
      }
      
      if (!user || !userId ) {
        reply.statusCode = 404;
        throw new Error (`here`);
      } else {
        user.subscribedToUserIds.push(userId.id);
        return await fastify.db.users.change(request.body.userId, user);
      }
      
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.body.userId });
      const userId = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });
      const booleanCheck = user?.subscribedToUserIds.includes(request.params.id);
      if (typeof request.params.id !== 'string' || !booleanCheck) {
        reply.statusCode = 400;
        throw new Error(`this is here`);
      }
      if (!user || !userId ) {
        reply.statusCode = 404;
        throw new Error (`here`);
      } else {
        user.subscribedToUserIds.map((item, index) => {
          user.subscribedToUserIds.splice(index, 1);
        })
        return await fastify.db.users.change(request.body.userId, user);       
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });
      if (user) return await fastify.db.users.change(request.params.id , request.body);
      reply.statusCode = 400;
      throw new Error;

      
    }
  );
};

export default plugin;
