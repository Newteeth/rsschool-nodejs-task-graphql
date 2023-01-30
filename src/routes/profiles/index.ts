import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: request.params.id });
      if (profile) return profile;
      reply.statusCode = 404;
      throw new Error;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const memberTypeId = await fastify.db.memberTypes.findOne({ key: 'id', equals: request.body.memberTypeId });
      const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: request.body.userId });      
      if(profile) {
        reply.statusCode = 400;
        throw new Error('Profile already exists');
      }
      if(!memberTypeId) {
        reply.statusCode = 400;
        throw new Error('memberTypeId not found');
      }
      return await fastify.db.profiles.create(request.body);
    });

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne( { key: 'id', equals: request.params.id});
      if (typeof request.params.id !== 'string' || !request.params.id) {
        reply.statusCode = 400;
        throw new Error;
      }      
      if (!profile) {
        reply.statusCode = 400;
      throw new Error;
      }
      return await fastify.db.profiles.delete(request.params.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profiles = await fastify.db.profiles.findMany();
      profiles.forEach(item => {
        if(!request.params.id || request.params.id !== 'string') return reply.statusCode = 400;
      });
      return await fastify.db.profiles.change(request.params.id, request.body);
    }
  );
};

export default plugin;
