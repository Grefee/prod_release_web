import { useEffect, useState } from "react"
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useMutation,
  } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { useSearchParams,
            Link } from "react-router-dom";
import Swal from 'sweetalert2'


const IP = process.env.REACT_APP_BACKEND_API
const conf = ['reports', 'config']
async function getTypyLinek (IP) {
    let response = await fetch(`http://${IP}:3005/getTypyLinek`);
    return response.json();
  }

  function AddNewLine({refetchTypyLinek}){
    const { status, error, mutate } = useMutation({
      mutationFn: ({newProductionLineName}) => {
        return fetch(`http://${IP}:3005/createNewLine`, {
          method: 'POST',
          body: JSON.stringify({PLine_name: newProductionLineName, }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      },
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'New Production Line added successfully'
        });
        refetchTypyLinek();
      },
      onError: () =>
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add new Production Line, something went wrong'
      })
    });
  
   const addNewLine = () => {
    Swal.fire({
      title: 'Add new Production Line',
      html: `
        <textarea id="productionLine-name" class="swal2-textarea" placeholder="ProdutionLine name" style="min-width: 350px; height: 100px; word-wrap: break-word;"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      preConfirm: async () => {
        let newProductionLineName = document.getElementById('productionLine-name').value;
         mutate({newProductionLineName});
       },
     });
   };
   return (
    <button className={`pt-2 pb-2 pl-4 pr-4 bg-slate-200 hover:bg-slate-400 w-fit rounded-full mt-5`} 
    id='newLine' onClick={addNewLine}
    >
    Add new line
  </button>
   );
  };


const queryClient = new QueryClient();

export default function Admin() {
  return (
    <QueryClientProvider client={queryClient}>
      <Administrator />
    </QueryClientProvider>
  );
}




function Administrator() {
    
    const {isLoading, data, refetch: refetchTypyLinek} = useQuery({queryKey: ['typyLinek'], queryFn: async () => await getTypyLinek(IP), initialData: []});

    const [lineNumber, setLineNumber] = useState(null)
    const [config, setConfig] = useState(null)

    const handleBtnLineId = (id) => {
        console.log('btnClicked: '+id);
        setLineNumber(id);
        setConfig(null) 
      };

    const handleConfigChange = (newConfig) => {
        setConfig(newConfig);
    };



if (isLoading) {
    return <span>Loading...</span>
    }
return (
<div className="flex flex-col items-center w-full">
            <div className="bg-gradient-to-r from-gray-700 to-gray-500 pt-16 pb-16 pl-8 pr-8 text-3xl w-screen text-center text-white ">
                <a>Admin Page</a>              
            </div>
            <div className="flex flex-row h-screen w-screen  ">
                <div className="bg-white w-1/12 border-r-2">
                    <div className="flex flex-col items-center">
                        {data.map((linka) => {
                            return <Link className={`pt-2 pb-2 pl-4 pr-4 hover:bg-slate-400 w-fit rounded-full mt-5 ${ linka.PLine_id === lineNumber ? "bg-blue-500 text-white" : "bg-slate-200" }`}
                        
                            key={linka.PLine_id}  
                            id={linka.PLine_id}
                            onClick={() => handleBtnLineId(linka.PLine_id)}
                            to={`/admin/${linka.PLine_id}`}
                                disabled={isLoading}
                                > {linka.PLine_name}
                            </Link>})}
                            <AddNewLine refetchTypyLinek={refetchTypyLinek}/>
                    </div>
                </div>
                <div className="bg-white w-1/12 border-r-2">
                    <div className="flex flex-col items-center">
                        {conf.map((conf) => {
                            return <Link  className={`pt-2 pb-2 pl-4 pr-4 hover:bg-slate-400 w-fit rounded-full mt-5
                            ${ conf === config ? "bg-blue-500 text-white" : "bg-slate-200" }`} id={conf} key={conf}
                            to={
                                lineNumber === null
                                ? void(0)
                                : `/admin/${lineNumber}/${conf}`

                            }
                            onClick = {
                                lineNumber === null
                                ?(e) => e.preventDefault()
                                :() => handleConfigChange(conf) 

                              } 
                            > {conf}
                            </Link>}
                        )}
                    </div>
                </div>
                <Outlet />

            </div>
</div>
)};




