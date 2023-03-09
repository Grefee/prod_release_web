import React, { useState ,useEffect } from "react";
import _ from 'lodash';
import Linka from "./home/Linka.jsx";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";



async function getTypyLinek(IP) {
  const response = await fetch(`http://${IP}:3005/getTypyLinek`);
      return response.json();
  }


const IP = '172.23.30.216'

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainHome />
    </QueryClientProvider>
  );
}


function MainHome() {
  const {isLoading: reportsLoad, data: typyLinek} = useQuery({queryKey: ['typyLinek'], queryFn: async () => await getTypyLinek(IP), initialData: []});

    const [selectedLinka, setSelectedLinka] = useState(null);

    const handleButtonClick = id => {
        setSelectedLinka(id);
      };

    const goToHome = () => {
    setSelectedLinka(null);
    }

    return (
        
        <div className="flex flex-col items-center w-full">
            {!selectedLinka ? (
                <div>
                    <div className="bg-gradient-to-r from-gray-700 to-gray-500 pt-16 pb-16 pl-8 pr-8 text-3xl w-screen text-center text-white ">Vyberte Linku</div>
                        <div className="flex flex-col items-center">
                        {typyLinek.map((linka) => {
                            return <button className="pt-5 pb-5 pl-5 pr-5 bg-green-200 w-fit rounded-full mt-5" id={linka.PLine_id}  onClick={() => handleButtonClick(linka.PLine_id)}> {linka.PLine_name}</button>
                            
                        })}
                        
                    </div>
                </div>
             ) : (
            <Linka apiIP={IP} linkaId={selectedLinka} goToHome={goToHome} />
            )}
        </div>
    );
}