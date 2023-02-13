// import { Login } from '@/components/login'
import ServerComponent from './test-server-component'

export default function Home() {
  // const [count, setCount] = useState(0)

  // function handleClick() {
  //   setCount(count + 1)
  // }

  return (
    <div className="text-blue-500">
      Hello world!
      {/* <Button count={count} onClick={handleClick} /> */}
      {/* {count} */}
      {/* <Login /> */}
      <ServerComponent />
    </div>
  )
}
