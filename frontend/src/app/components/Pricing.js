'use client';
// import Button from'../components/ui/Button';

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$11",
      features: [
        "500 Career Cards",
        "Basic AI filtering", 
        "Email notifications"
      ],
      buttonText: "Get Started",
      buttonStyle: "outline",
      popular: false
    },
    {
      name: "Professional",
      price: "$19", 
      features: [
        "1000 Career Cards",
        "Advanced AI filtering",
        "Real-time dashboard",
        "Priority support"
      ],
      buttonText: "Get Started",
      buttonStyle: "primary",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$25",
      features: [
        "1500 Career Cards",
        "Custom AI training",
        "API access",
        "Dedicated support"
      ],
      buttonText: "Contact Sales", 
      buttonStyle: "outline",
      popular: false
    }
  ]

  return (
    <section id="pricing" className=" bg-[#030604] w-full py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[24px] sm:text-[36px] lg:text-[48px] font-black leading-[30px] sm:leading-[44px] lg:leading-[48px] font-['Inter'] mb-3">
            <span className="text-white">Choose Your</span>
            <span className="text-[#00fa92]"> Success Plan</span>
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[20px] sm:leading-[23px] lg:leading-[25px] text-[#d1d5db] text-center font-['Inter']">
            Scale your job search automation to match your ambition
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, index) => (
            <div key={index} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-[#00fa92] text-[#030604] text-[14px] font-bold leading-[17px] font-['Inter'] px-[22px] py-[6px] rounded-[16px] shadow-[0px_0px_23px_#00fa9279]">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className={`bg-[#ffffff0c] ${plan.popular ? 'border-2 border-[#00fa92] shadow-[0px_0px_20px_#00fa924c]' : 'border border-[#ffffff19]'} rounded-[16px] p-6 lg:p-8 ${plan.popular ? 'transform scale-105' : ''} transition-all duration-300 hover:border-[#00fa924c]`}>
                <div className="text-center mb-6">
                  <h3 className="text-[20px] sm:text-[24px] font-bold leading-[24px] sm:leading-[30px] text-white font-['Inter'] mb-4">
                    {plan.name}
                  </h3>
                  <div className="text-[28px] sm:text-[36px] font-black leading-[34px] sm:leading-[44px] text-white font-['Inter']">
                    {plan.price}
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <img 
                        src="/images/img_i_green_a400_24x14.svg" 
                        alt="" 
                        className="w-[14px] h-[24px] flex-shrink-0"
                      />
                      <span className="text-[14px] sm:text-[16px] font-normal leading-[18px] sm:leading-[20px] text-white font-['Inter']">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                {plan.buttonStyle === 'primary' ? (
                  <button
                    text={plan.buttonText}
                    text_font_size="16"
                    text_font_weight="700"
                    text_color="#030604"
                    fill_background_color="#00fa92"
                    border_border_radius="24px"
                    padding="12px 34px"
                    className="w-full"
                  />
                ) : (
                  <button className="w-full px-8 py-3 text-[16px] font-normal text-[#00fa92] border border-[#00fa92] rounded-[24px] hover:bg-[#00fa92] hover:text-[#030604] transition-all duration-200 font-['Inter']">
                    {plan.buttonText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}