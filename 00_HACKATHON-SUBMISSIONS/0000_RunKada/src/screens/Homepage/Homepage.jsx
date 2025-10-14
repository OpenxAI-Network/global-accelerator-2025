import React from "react";
import { Button } from "../../components/ui/button";

const navigationItems = [
  { label: "Home", active: true },
  { label: "rank", active: false },
  { label: "about", active: false },
  { label: "clan", active: false },
];

const runningManIcons = [
  { top: "top-[1278px]", left: "left-[181px]" },
  { top: "top-[1345px]", left: "left-[239px]" },
  { top: "top-[1336px]", left: "left-[193px]" },
  { top: "top-[1401px]", left: "left-[188px]" },
  { top: "top-[1383px]", left: "left-[248px]" },
  { top: "top-[1445px]", left: "left-[206px]" },
];

const verticalLines = [
  { top: "top-[999px]", left: "left-[232px]", height: "h-[1984px]" },
  { top: "top-[999px]", left: "left-[289px]", height: "h-[1778px]" },
  { top: "top-[999px]", left: "left-[346px]", height: "h-[1465px]" },
  { top: "top-[999px]", left: "left-[406px]", height: "h-[1239px]" },
  { top: "top-[996px]", left: "left-[474px]", height: "h-[959px]" },
  { top: "top-[993px]", left: "left-[165px]", height: "h-[2376px]" },
];

const faqItems = [
  {
    number: "1",
    question: "Q: What is Runkada?",
    answer:
      "A: Runkada is a web application that syncs with your Strava account to collect and total your running kilometers. We turn your miles into a friendly competition by ranking you against others in your Clan and ranking your Clan against others in your area!",
    topPosition: "top-[1939px]",
    leftPosition: "left-[489px]",
    badgeTop: "top-[1888px]",
    badgeLeft: "left-[421px]",
  },
  {
    number: "2",
    question: "Q: How do I sign up and start using Runkada?",
    answer:
      "A: Runkada is a web application that syncs with your Strava account to collect and total your running kilometers. We turn your miles into a friendly competition by ranking you against others in your Clan and ranking your Clan against others in your area!",
    topPosition: "top-[2186px]",
    leftPosition: "left-[464px]",
    badgeTop: "top-[2138px]",
    badgeLeft: "left-[372px]",
  },
  {
    number: "3",
    question: "Q: Which activities count towards my ranking?",
    answer:
      "A: Currently, only running activities tracked on Strava count towards your total accumulated kilometers and your Clan's ranking.",
    topPosition: "top-[2453px]",
    leftPosition: "left-[421px]",
    badgeTop: "top-[2400px]",
    badgeLeft: "left-[329px]",
  },
  {
    number: "4",
    question: "Q: What is a Clan?",
    answer:
      "A: A Clan is a team or group of Runkada users. When you join or create a Clan, your individual accumulated kilometers contribute to your Clan's total distance.",
    topPosition: "top-[2719px]",
    leftPosition: "left-[341px]",
    badgeTop: "top-[2668px]",
    badgeLeft: "left-[252px]",
  },
  {
    number: "5",
    question: "Q: How do I join or create a Clan?",
    answer:
      'A: Once logged in, you can search for existing Clans to join or use the "Create Clan" option. You must be part of a Clan to be included in any rankings.',
    topPosition: "top-[2972px]",
    leftPosition: "left-[292px]",
    badgeTop: "top-[2934px]",
    badgeLeft: "left-[206px]",
  },
];

const teamMembers = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man-2.png",
    alt: "Man",
    left: "left-[189px]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man--1--1.png",
    alt: "Man",
    left: "left-[324px]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/woman--1--1.png",
    alt: "Woman",
    left: "left-[459px]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/woman-1.png",
    alt: "Woman",
    left: "left-[594px]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man--2--1.png",
    alt: "Man",
    left: "left-[729px]",
  },
];

const shoesIcons = [
  { top: "top-[3298px]", left: "left-[883px]", size: "w-[41px] h-[41px]" },
  { top: "top-[3297px]", left: "left-[929px]", size: "w-[41px] h-[41px]" },
  { top: "top-[3308px]", left: "left-[986px]", size: "w-7 h-7" },
  { top: "top-[3307px]", left: "left-[1015px]", size: "w-7 h-7" },
];

const footerLinks = ["Home", "Rank", "About", "Clan", "Log In"];

const socialIcons = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-2.svg",
    width: "w-[83.33%]",
    height: "h-[83.33%]",
    left: "left-[2.49%]",
    top: "top-[2.31%]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon.svg",
    width: "w-[45.83%]",
    height: "h-[83.33%]",
    left: "left-[23.33%]",
    top: "top-[2.31%]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-1.svg",
    width: "w-[83.33%]",
    height: "h-[79.17%]",
    left: "left-[2.49%]",
    top: "top-[2.31%]",
  },
];

export const Homepage = () => {
  return (
    <div
      className="bg-white overflow-hidden w-full min-w-[1280px] min-h-[4240px] relative"
      data-model-id="7:3"
    >
      <header className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
        <img
          className="left-0 h-[183px] absolute top-0 w-[232px]"
          alt="Logofull"
          src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
        />

        <nav className="absolute top-[49px] left-[315px] w-[649px] h-[70px] bg-[#f7e2c680] rounded-[30px]" />

        <Button
          variant="outline"
          className="absolute top-[49px] left-[1047px] w-[161px] h-[70px] rounded-[30px] border border-solid border-[#56504a] bg-transparent hover:bg-[#f7e2c6] transition-colors h-auto"
        >
          <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-base">
            log in
          </span>
        </Button>

        <div className="absolute top-[57px] left-[368px] w-[125px] h-[54px] bg-[#f7e2c6] rounded-[30px]" />

        {navigationItems.map((item, index) => (
          <button
            key={item.label}
            className={`absolute top-[77px] ${
              index === 0
                ? "left-[394px]"
                : index === 1
                  ? "left-[515px]"
                  : index === 2
                    ? "left-[646px]"
                    : "left-[790px]"
            } w-${index === 0 ? "[73px]" : index === 1 ? "[83px]" : "24"} [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-base text-center tracking-[0] leading-[normal] whitespace-nowrap hover:opacity-70 transition-opacity`}
          >
            {item.label}
          </button>
        ))}
      </header>

      <section className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
        <div className="absolute top-[736px] left-[586px] w-[1047px] h-[648px] bg-[#fcd96b] rounded-[196px]" />

        <div className="absolute top-[747px] left-[601px] w-[1058px] h-[648px] bg-[#56504a] rounded-[196px]" />

        <h1 className="absolute top-60 left-[640px] w-[572px] [font-family:'Porter_Sans_Block-Regular',Helvetica] font-normal text-transparent text-[76px] tracking-[0] leading-[normal]">
          <span className="text-[#56504a]">
            Find your stride, <br />
            find your{" "}
          </span>
          <span className="text-[#fcd96b]">tribe</span>
        </h1>

        <img
          className="absolute top-[756px] left-[615px] w-[665px] h-[1022px] rounded-[196px] object-cover"
          alt="Rectangle"
          src="https://c.animaapp.com/mgqjxiy6qqDflS/img/rectangle.png"
        />

        {verticalLines.map((line, index) => (
          <img
            key={`line-${index}`}
            className={`absolute ${line.top} ${line.left} w-[3px] ${line.height}`}
            alt="Line"
            src={`https://c.animaapp.com/mgqjxiy6qqDflS/img/line-${index === 5 ? "5" : index === 4 ? "6" : index + 1}.svg`}
          />
        ))}

        <img
          className="absolute top-[91px] left-0 w-[805px] h-[980px] object-cover"
          alt="Iphone"
          src="https://c.animaapp.com/mgqjxiy6qqDflS/img/iphone-1.png"
        />

        <img
          className="absolute top-[898px] left-[643px] w-[637px] h-[821px]"
          alt="Element"
          src="https://c.animaapp.com/mgqjxiy6qqDflS/img/4-420.svg"
        />

        <img
          className="absolute w-[25.00%] h-[11.04%] top-[6.11%] left-[12.11%]"
          alt="Logo"
          src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logo-3.svg"
        />

        <Button
          variant="outline"
          className="absolute top-[616px] left-[217px] w-[201px] h-[47px] rounded-[30px] border border-solid border-[#56504a] bg-transparent hover:bg-[#f7e2c6] transition-colors h-auto"
        >
          <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-base">
            LET&apos;S GO
          </span>
        </Button>

        <Button className="absolute top-[677px] left-[218px] w-[201px] h-[47px] bg-[#f7e2c6] rounded-[30px] hover:bg-[#fcd96b] transition-colors h-auto">
          <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-base">
            MORE
          </span>
        </Button>

        {runningManIcons.map((icon, index) => (
          <img
            key={`running-man-${index}`}
            className={`${icon.top} ${icon.left} absolute w-[25px] h-[25px] object-cover`}
            alt="Running man"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/running-man-6.png"
          />
        ))}

        <div className="absolute top-[1719px] left-[963px] flex gap-[20px]">
          {[0, 1, 2].map((index) => (
            <div
              key={`dot-${index}`}
              className="w-[27px] h-[27px] bg-[#fcd96b80] rounded-[13.5px]"
            />
          ))}
        </div>
      </section>

      <section className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        {faqItems.map((faq, index) => (
          <div key={`faq-${index}`}>
            <div
              className={`absolute ${faq.topPosition} ${faq.leftPosition} w-[748px] h-[198px] rounded-[20px] border-[3px] border-solid border-black`}
            />

            <div
              className={`absolute ${faq.topPosition} ${faq.leftPosition} w-[748px] h-[52px] rounded-[20px] border-[3px] border-solid border-black`}
            />

            <div
              className={`absolute ${faq.badgeTop} ${faq.badgeLeft} w-[135px] h-[134px] bg-[#fcd96b] rounded-[67.5px/67px]`}
            />

            <div
              className={`absolute ${faq.badgeTop.replace(/top-\[(\d+)px\]/, (match, p1) => `top-[${Number.parseInt(p1) + 16}px]`)} ${faq.badgeLeft.replace(/left-\[(\d+)px\]/, (match, p1) => `left-[${Number.parseInt(p1) + 16}px]`)} w-[103px] h-[102px] bg-white rounded-[51.5px/51px]`}
            />

            {index === 4 && (
              <div
                className={`absolute ${faq.badgeTop.replace(/top-\[(\d+)px\]/, (match, p1) => `top-[${Number.parseInt(p1) + 39}px]`)} ${faq.badgeLeft.replace(/left-\[(\d+)px\]/, (match, p1) => `left-[${Number.parseInt(p1) + 58}px]`)} w-[45px] [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-black text-[62px] text-center tracking-[0] leading-[normal] whitespace-nowrap`}
              >
                {faq.number}
              </div>
            )}

            <div
              className={`absolute ${faq.topPosition.replace(/top-\[(\d+)px\]/, (match, p1) => `top-[${Number.parseInt(p1) + 14}px]`)} ${faq.leftPosition.replace(/left-\[(\d+)px\]/, (match, p1) => `left-[${Number.parseInt(p1) + 83}px]`)} w-[326px] [font-family:'Poppins',Helvetica] font-bold text-black text-base tracking-[0] leading-[normal]`}
            >
              {faq.question}
            </div>

            <div
              className={`absolute ${faq.topPosition.replace(/top-\[(\d+)px\]/, (match, p1) => `top-[${Number.parseInt(p1) + 65}px]`)} ${faq.leftPosition.replace(/left-\[(\d+)px\]/, (match, p1) => `left-[${Number.parseInt(p1) + 67}px]`)} w-[656px] [font-family:'Poppins',Helvetica] font-medium text-black text-base tracking-[0] leading-[normal]`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </section>

      <section className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <div className="absolute top-[3339px] left-[166px] w-[923px] h-[146px] rounded-[30px] border-[3px] border-solid border-black" />

        <h2 className="absolute top-[3251px] left-[206px] w-[638px] [font-family:'Porter_Sans_Block-Regular',Helvetica] font-normal text-transparent text-[32px] tracking-[0] leading-[normal]">
          <span className="text-black">about runkada </span>
          <span className="text-[#fcd96b]">developers</span>
        </h2>

        {shoesIcons.map((shoe, index) => (
          <img
            key={`shoe-${index}`}
            className={`${shoe.top} ${shoe.left} ${shoe.size} absolute object-cover`}
            alt="Shoes"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/shoes-5.png"
          />
        ))}

        {teamMembers.map((member, index) => (
          <div key={`member-${index}`}>
            <div
              className={`absolute top-[3364px] ${member.left} w-[115px] h-[95px] rounded-[30px] border-[3px] border-solid border-black`}
            />
            <img
              className={`absolute ${index === 0 ? "top-[3381px] left-[209px] w-[75px] h-[75px]" : index === 1 ? "top-[3373px] left-[340px] w-[83px] h-[83px]" : `top-[3377px] ${member.left.replace(/left-\[(\d+)px\]/, (match, p1) => `left-[${Number.parseInt(p1) + 18}px]`)} w-[79px] h-[79px]`} object-cover`}
              alt={member.alt}
              src={member.src}
            />
          </div>
        ))}

        <div className="absolute top-[3364px] left-[864px] w-[197px] h-[95px] rounded-[30px] border-[3px] border-solid border-black" />

        <div className="absolute top-[3382px] left-[862px] w-[202px] [font-family:'Poppins',Helvetica] font-bold text-black text-sm text-center tracking-[0] leading-[normal]">
          This team is formed for <br />
          the 2025 OpenxAI Hack Node Hackathon
        </div>
      </section>

      <footer className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
        <div className="absolute top-[3608px] left-[307px] w-[662px] h-[430px]">
          <div className="absolute top-[181px] left-0 w-[656px] [font-family:'Poppins',Helvetica] font-normal text-black text-base text-center tracking-[0] leading-[normal]">
            <span className="font-medium">At Runkada, we believe that </span>
            <span className="font-bold">running is better together. </span>
            <span className="font-medium">
              We exist to transform an individual pursuit into a shared
              challenge, using friendly Clan competition to keep everyone
              motivated and accountable.
            </span>
          </div>

          <div className="absolute top-[255px] left-[227px] w-[165px] [font-family:'Poppins',Helvetica] font-medium text-black text-base text-center tracking-[0] leading-[normal]">
            © Runkada 2025
          </div>

          <nav className="absolute top-[328px] left-[194px] w-[242px] [font-family:'Poppins',Helvetica] font-normal text-black text-base text-center tracking-[0] leading-[30px]">
            {footerLinks.map((link, index) => (
              <React.Fragment key={link}>
                <button className="hover:opacity-70 transition-opacity">
                  {link}
                </button>
                {index < footerLinks.length - 1 && <br />}
              </React.Fragment>
            ))}
          </nav>

          <img
            className="left-[196px] h-[199px] absolute top-0 w-[232px]"
            alt="Logofull"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-2.svg"
          />
        </div>

        <div className="absolute top-[4133px] left-[549px] w-[147px] h-9 flex gap-[22px]">
          {socialIcons.map((icon, index) => (
            <button
              key={`social-${index}`}
              className={`${index === 2 ? "" : "mt-[2.8px]"} w-[34.25px] h-[33.23px] relative ${index === 0 ? "ml-0" : ""} hover:opacity-70 transition-opacity`}
            >
              <img
                className={`${icon.width} ${icon.height} ${icon.left} absolute ${icon.top}`}
                alt="Icon"
                src={icon.src}
              />
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
