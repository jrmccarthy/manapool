'use client'

import { useState, Dispatch } from 'react';

const BASE_API_URL = "/api"
const INVENTORY_PATH = "seller/inventory"
const INVENTORY_URL = `${BASE_API_URL}/${INVENTORY_PATH}?limit=100&offset=0&minQuantity=1`

const DEFAULT_EMAIL = ''
const DEFAULT_API_KEY = ''

type UUID = string

interface InventoryItem  {
  id: string,
  product_type: string,
  product_id: UUID,
  product: {
    type: string,
    id: UUID,
    tcgplayer_sku: number,
    single: {
      scryfall_id: UUID,
      mtgjson_id: UUID,
      tcgplayer_id: string,
      name: string,
      set: string,
      number: string,
      language_id: string,
      condition_id: string,
      finish_id: string
    },
    sealed: {
      mtgjson_id: UUID,
      tcgplayer_id: number,
      name: string,
      set: string,
      language_id: string
    }
  },
  price_cents: number,
  quantity: number,
  effective_as_of: string,
  pricing_anomaly: {
    anomaly_type: string,
    ratio: number,
    overage_cents: number
  }
}

interface parsedItem {
  id: string,
  scryfall_id: UUID,
  name: string,
  set: string,
  language_id: string,
  finish_id: string
  price_cents: number,
  quantity: number,
}

function parseInventoryItem(item: InventoryItem): parsedItem {
  return {
    id: item?.id,
    scryfall_id: item?.product?.single?.scryfall_id,
    name: item.product.single.name,
    set: item.product.single.set,
    language_id: item.product.single.language_id,
    finish_id: item.product.single.finish_id,
    price_cents: item.price_cents,
    quantity: item.quantity
  }
}

export default function Home() {
  const [inventory, setIntenvory] = useState<Array<InventoryItem>>([])

  return (
    <div>
      <AccessContainer setInventory={setIntenvory} />
      <br />
      <InventoryContainer inventory={inventory} setInventory={setIntenvory}/>
    </div>
  )
}

function AccessContainer({setInventory}: {setInventory: Dispatch<Array<InventoryItem>>}) {
  const [email, setEmail] = useState<string>(DEFAULT_EMAIL || "")
  const [apiToken, setApiToken] = useState<string>(DEFAULT_API_KEY || "")
  

  function fetchInventory() {
    fetch(
      INVENTORY_URL, {
        headers: {
          'X-ManaPool-Email': email,
          'X-ManaPool-Access-Token': apiToken,
          'Accept': 'application/json'
        },
      }
    ).then(response => {
      return response.json()
    }).then(data => {
      return setInventory(data?.inventory || "")
    }).catch(e => {
      console.error(e)
    })
  }

  return (
    <div className="bg-gray-100 px-3 pt-3 w-200">
      <h1 className="font-bold text-lg">Manapool Singles Inventory Viewer</h1>
      <br />
      <ApiTokenContainer apiToken={apiToken} setApiToken={setApiToken} email={email} setEmail={setEmail} fetchInventory={fetchInventory}/>
    </div>
  )
}

interface IApiTokenContainer {
  apiToken: string,
  setApiToken: Dispatch<string>
  email: string,
  setEmail: Dispatch<string>
  fetchInventory: Function
}

function ApiTokenContainer({apiToken, setApiToken, email, setEmail, fetchInventory}: IApiTokenContainer) {
  function submit(e: any) {
    e.preventDefault()
    setApiToken(apiToken)
    fetchInventory()
  }

  function handleChangeApiToken(e: any) {
    setApiToken(e.target.value)
  }

  function handleChangeEmail(e: any) {
    setEmail(e.target.value)
  }

  return (
    <form>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div className="w-64">
          <label htmlFor="apiToken" className="block mb-2.5 text-heading font-medium">Email for Manapool.com: </label>
          <input type="text" id="email" value={email} onChange={handleChangeEmail} className="bg-neutral-secondary-medium border border-default-medium"></input>
        </div>
        <div className="w-64">
          <label htmlFor="apiToken" className="block mb-2.5 text-heading font-medium">API Token for Manapool.com: </label>
          <input type="text" id="apiToken" value={apiToken} onChange={handleChangeApiToken} className="bg-neutral-secondary-medium border border-default-medium"></input>
        </div>
        <div className="w-64 pt-2">
          <button type="submit" onClick={submit} className="bg-blue-300 rounded-md font-medium text-sm px-4 py-2.5">Load Inventory</button>
        </div>
      </div>
    </form>
  )
}

function InventoryContainer({inventory, setInventory}: {inventory: Array<InventoryItem>, setInventory: Dispatch<Array<InventoryItem>>}) {

  return (
    <div className="bg-gray-100 px-3 pt-3 w-200">
      <header>Inventory:</header>
      <br />
      <div>
        <Inventory inventory={inventory} />
      </div>
    </div>
  )
}

function Inventory({inventory}: {inventory: Array<InventoryItem>}) {
  function getScryfallLink(id: string) {
    return fetch('https://api.scryfall.com/cards/' + id).then((resp) => resp.json()).then((json) => json?.scryfall_uri).catch((e) => null)
  }

  return (
    <div>
      {inventory.length !== 0 &&
        <table className='table-auto'>
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Card Name</th>
              <th>Set</th>
              <th>Language</th>
              <th>Finish</th>
              <th>Price(cents)</th>
              <th>View Image(scryfall)</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((invitem) => (parseInventoryItem(invitem))).map((item) => (
              <tr key={item.id}>
                <td>{item.quantity}</td>
                <td>{item.name}</td>
                <td>{item.set}</td>
                <td>{item.language_id}</td>
                <td>{item.finish_id}</td>
                <td>{item.price_cents}</td>
                <td><a target='_new' href={'https://api.scryfall.com/cards/' + item.scryfall_id + '?format=image'}>Link to scryfall</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      || 
        <div>Sorry, no inventory data found</div>
      }
    </div>
  )
}
