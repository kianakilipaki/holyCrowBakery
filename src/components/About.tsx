import { Divider, GFBadge } from './GothicDecor'
import bakerImage from '../assets/baker.jpg'
import browniesImage from '../assets/brownies.jpeg'

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden py-16 sm:py-24" style={{ backgroundColor: '#fcf6e8' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Image side */}
          <div className="relative mx-auto h-[420px] w-full max-w-[540px] sm:h-[610px]">
            <div className="absolute left-[3%] top-[10%] h-52 w-52 rounded-full bg-[#d094ad]/12 sm:h-64 sm:w-64" />
            <div className="absolute bottom-[8%] right-[2%] h-64 w-64 rounded-full bg-[#9da23d]/10 sm:h-72 sm:w-72" />

            <figure className="absolute right-[1%] top-[4%] z-10 w-[62%] rotate-[7deg] bg-[#fffdf7] p-3 pb-12 shadow-[0_14px_30px_rgba(14,12,8,0.24)] sm:p-4 sm:pb-14">
              <div className="absolute -top-7 left-1/2 z-20 h-20 w-24 -translate-x-1/2 -rotate-[3deg] border-y border-white/20 bg-[#c6a061]/65 shadow-sm"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 5px)' }} />
              <img src={browniesImage} alt="Fresh chocolate brownies" className="aspect-[4/5] w-full object-cover" />
              <figcaption className="absolute inset-x-3 bottom-3 text-center text-xs italic text-[#3d4547]/70 sm:bottom-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                fresh from the oven
              </figcaption>
            </figure>

            <figure className="absolute bottom-[3%] left-[1%] z-20 w-[68%] -rotate-[6deg] bg-[#fffdf7] p-3 pb-12 shadow-[0_16px_34px_rgba(14,12,8,0.28)] sm:p-4 sm:pb-14">
              <div className="absolute -top-7 left-[48%] z-30 h-20 w-24 -translate-x-1/2 rotate-[4deg] border-y border-white/20 bg-[#c6a061]/65 shadow-sm"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 5px)' }} />
              <img
                src={bakerImage}
                alt="The baker behind Holy Crow Bakery"
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <figcaption className="absolute inset-x-3 bottom-3 text-center text-xs italic text-[#3d4547]/70 sm:bottom-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                baked with a little crow charm
              </figcaption>
            </figure>
            {/* Decorative star */}
            <div className="hidden absolute -top-4 -left-4 w-10 h-10 rounded-full items-center justify-center text-lg"
              style={{ backgroundColor: '#d094ad', color: '#fcf6e8' }}>
              ✦
            </div>
          </div>

          {/* Text side */}
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.22rem] text-[#d094ad] sm:mb-4 sm:text-xs sm:tracking-[0.4rem]" style={{ fontFamily: 'Cinzel, serif' }}>
              ⋆ About the Bakery ⋆
            </p>
            <h2 className="mb-5 text-3xl leading-tight text-[#0e0c08] sm:mb-6 sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Baked with<br />
              <span style={{ color: '#d094ad' }}>a little crow charm</span>
            </h2>

            <div className="space-y-4 text-[#3d4547] leading-relaxed" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.0625rem' }}>
              <p>
                Hi, I'm the baker behind Holy Crow Bakery, creating small-batch, flavor-forward treats with a little crow-inspired charm.
              </p>
              <p>
                Everything is made from scratch without gluten-containing ingredients and with careful practices intended to reduce
                cross-contact. I do my best to bake with celiac safety in mind, but cannot guarantee a completely gluten-free environment.
                Weekly orders close Thursday for Saturday pickup in Daybreak, South Jordan.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <GFBadge />
              <div className="flex flex-col gap-3 mt-4">
                {[
                  { icon: '☽', text: 'Careful preparation intended to reduce gluten cross-contact' },
                  { icon: '✦', text: 'Small-batch weekly bakes — freshness guaranteed' },
                  { icon: '◈', text: 'All items are baked fresh for weekly pre-orders' },
                  { icon: '⋆', text: 'Saturday pickup · Pay by Venmo or in person' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-[#d094ad] mt-0.5 shrink-0" style={{ width: '15px' }}>{item.icon}</span>
                    <p className="text-sm text-[#3d4547]" style={{ fontFamily: 'Nunito, sans-serif' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Divider />
      </div>
    </section>
  )
}
