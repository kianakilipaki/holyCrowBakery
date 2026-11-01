import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Menu from '../components/Menu'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Menu />
      <Contact />
      <Footer />
      <CartDrawer />
    </>
  )
}
