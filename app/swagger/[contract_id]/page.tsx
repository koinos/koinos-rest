import { createSwaggerSpec } from 'next-swagger-doc'
import ReactSwagger from './react-swagger'
import 'swagger-ui-react/swagger-ui.css'
import {getContractSwagger} from '@/utils/swagger'

const getApiDocs = async (contract_id: string) => {
  const spec = createSwaggerSpec({definition: await getContractSwagger(contract_id)})
  return spec
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ contract_id: string }>
})
{
  const spec = await getApiDocs((await params).contract_id)
  return (
    <section className='container'>
      <ReactSwagger spec={spec} />
    </section>
  )
}
