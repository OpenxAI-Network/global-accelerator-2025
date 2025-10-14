import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";

export const Clan = () => {
  return (
    <div className="bg-white min-h-screen w-full p-8">
      <header className="mb-8">
        <Link to="/">
          <img
            className="h-[120px] w-auto"
            alt="Logofull"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
          />
        </Link>
      </header>

      <div className="max-w-4xl mx-auto">
        <h1 className="[font-family:'Porter_Sans_Block-Regular',Helvetica] font-normal text-[#56504a] text-6xl mb-8">
          Clan
        </h1>
        
        <p className="[font-family:'Poppins',Helvetica] font-normal text-black text-lg mb-8">
          Manage your clan and view clan statistics.
        </p>

        <Link to="/">
          <Button className="bg-[#f7e2c6] hover:bg-[#fcd96b] text-[#56504a] rounded-[30px]">
            <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-base">
              Back to Home
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
