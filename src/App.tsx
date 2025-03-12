import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { Line } from './lib/Components'
import Api from './lib/api';

function App() {
  const [key, setKey] = useState(import.meta.env.VITE_API_KEY || "");
  const [api, setApi] = useState<null | Api>(import.meta.env.DEV ? new Api(import.meta.env.VITE_API_KEY) : null);
  const [lines, setLines] = useState<Array<string>>([]);

  const handleAddKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get("api_key");
    if (key) {
      setKey(key.toString());
      setApi(new Api(key.toString()));
      e.currentTarget.reset();
    }
  }

  const handleAddLine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextLine = formData.get("nextLine");
    if (nextLine) {
      setLines([...lines, nextLine.toString()])
      e.currentTarget.reset();
    }
  }

  return (
    <>
      {!import.meta.env.DEV && (
      <form onSubmit={handleAddKey}>
        <input type="text" name="api_key" id="api_key" placeholder='Your ChatGPT api key' />
        <button type="submit">Set Key</button>
      </form>
      )}
      <form onSubmit={handleAddLine}>
        <input type="text" name="nextLine" id="nextLine" placeholder='Input Chinese text' />
        <button type="submit">Add Line</button>
      </form>
      {lines.map((line, i) => (
        <Line api={api} line={line} key={i} />
      ))}
    </>
  )
}

export default App
