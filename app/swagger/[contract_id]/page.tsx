import { createSwaggerSpec } from 'next-swagger-doc'
import ReactSwagger from './react-swagger'
import 'swagger-ui-react/swagger-ui.css'
import {getContractSwagger} from '@/utils/swagger'

const getApiDocs = async (contract_id: string) => {
  return createSwaggerSpec({definition: await getContractSwagger(contract_id)})
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ contract_id: string }>
})
{
  const contract_id = (await params).contract_id.replace("%40", "@");

  try {
    const spec = await getApiDocs(contract_id)
    return (
      <section className='container'>
        <ReactSwagger spec={spec} />
      </section>
    )
  }
  catch (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>{'An error occurred'}</h1>
      <p>{`The contract '${contract_id}' either does not exist or has an invalid ABI.`}</p>
      <p>{`${error}`}</p>
    </div>
    )
  }
}
