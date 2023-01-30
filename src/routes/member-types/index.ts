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
      if (member) return member;
      reply.statusCode = 404;
      throw new Error;
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
      const members =await fastify.db.memberTypes.findMany();
      members.forEach(item => {
        if (!request.params.id || (typeof request.params.id !== 'string')) {
          reply.statusCode = 400;
          throw new Error;
        }
      });      
      const member = await fastify.db.memberTypes.change(request.params.id, request.body);
      if (member) return member;
      reply.statusCode = 400;
      throw new Error;
    }
  );
};

export default plugin;
