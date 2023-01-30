import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return await fastify.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const member =  await fastify.db.memberTypes.findOne({ key: 'id', equals: request.params.id});
      if (!member) {
        reply.statusCode = 404;
        throw new Error;
      }
    return member;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      if (typeof request.params.id !== 'string') {
        reply.statusCode = 400;
        throw new Error;
      }
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: request.params.id });
      if (!memberType) {
        reply.statusCode = 400;
        throw new Error;
      }
      return await fastify.db.memberTypes.change(request.params.id, request.body);
    }
  );
};

export default plugin;
