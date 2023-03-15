import { useEffect } from "react"
import {
    QueryClient,
    QueryClientProvider,
    useQueryClient,
    useQuery,
    useMutation,
  } from "@tanstack/react-query";

import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'


async function getOperations(IP, linkaId) {
    let response = await fetch(`http://${IP}:3005/getOperationsByLineId`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            PLine_id: linkaId,
        }),   
    })
    return response.json();
}
async function getProcesses(IP, linkaId) {
    let response = await fetch(`http://${IP}:3005/getProcessesByLineId`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            PLine_id: linkaId,
        }),   
    })
    return response.json();
}
async function getNameOfLine(IP, lineId) {
    const response = await fetch(`http://${IP}:3005/getNameOfLine`, {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                PLine_id: lineId,
            }),
        });
        return response.json();
}


const IP = process.env.REACT_APP_BACKEND_API

function AddNewProcess({operationID, refetchProcesses}) {
    const { status, error, mutate } = useMutation({
        mutationFn: ({processName, operationID, processType}) => {
          return fetch(`http://${IP}:3005/createNewProcess`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Process_name: processName,
              Operation_id: operationID,
              Process_type: processType,
            }),
            
          });
          
        },
        onSuccess: () => {
            Swal.fire({
            icon: "success",
            title: "Success",
            text: "New process added successfully",
          });
          refetchProcesses();
        },
        onError: () =>
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to add new process",
          }),
      });

     const addNewProcess = () => {
       Swal.fire({
         title: "Add new process",
         html: `
           <textarea id="process-name" class="swal2-textarea" placeholder="Process name" style="min-width: 350px; height: 100px; word-wrap: break-word;"></textarea>
           <label for="process-type" style="display: inline-block; margin-top: 10px;">Pick process type:</label>
           <select id="process-type" class="swal2-select" style="margin-left: 10px; border: 1px solid #d9d9d9;">
             <option value="btn">Y/N button</option>
             <option value="text">Text</option>
           </select>
         `,
         showCancelButton: true,
         confirmButtonText: "Confirm",
         cancelButtonText: "Cancel",
         preConfirm: async () => {
           let processName = document.getElementById("process-name").value;
           let processType = document.getElementById("process-type").value;
           mutate({processName, operationID, processType});
         },
       });
     };
     return (
       <button className="ml-5 rounded-full bg-slate-200 hover:bg-slate-400 p-2" onClick={addNewProcess}>+Add new Process</button>
     );
    };

function DeleteProcess({processID, refetchProcesses}){
  const { status, error, mutate } = useMutation({
    mutationFn: ({processID}) => {
      return fetch(`http://${IP}:3005/deleteProcess`, {
        method: 'DELETE',
        body: JSON.stringify({Process_id: processID}),
        headers: {
            'Content-Type': 'application/json'
        }
    });   
  },
  onSuccess: () => {
      Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Process deleted successfully'
    });
    refetchProcesses();
  },
  onError: () =>
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete process, something went wrong'
    }),
});
const deleteProcess = () => {
  Swal.fire({
    title: `Are you sure you want to delete process ID: ${processID}`,
    text: "",
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    focusConfirm: false,
    preConfirm: async () => {
      mutate({processID});
    },
  });
};
return (
  <button className="ml-5 rounded-full bg-slate-200 hover:bg-slate-400 p-2" onClick={deleteProcess}>Delete</button>
);
};

function ChangeProcess({processID, processName, processType, refetchProcesses}){
  const { status, error, mutate } = useMutation({
    mutationFn: ({processID, updatedProcessName, updatedProcessType }) => {
      return fetch(`http://${IP}:3005/changeProcess`, {
        method: 'PUT',
        body: JSON.stringify({Process_id: processID, Process_name: updatedProcessName, Process_type: updatedProcessType}),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  },
  onSuccess: () => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Process changed successfully'
    });
    refetchProcesses();
  },
  onError: () =>
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to change process, something went wrong'
    })
  });
const changeProcess = () => {
    Swal.fire({
      title: 'Change process',
      html: `
          <textarea id="process-name" class="swal2-textarea" placeholder="Process name" style="min-width: 350px; height: 100px; word-wrap: break-word;">${processName}</textarea>
          <label for="process-type" style="display: inline-block; margin-top: 10px;">Pick process type:</label>
          <select id="process-type" class="swal2-select" style="margin-left: 10px; border: 1px solid #d9d9d9;">
            <option value="btn" ${processType === 'btn' ? 'selected' : ''}>Y/N button</option>
            <option value="text" ${processType === 'text' ? 'selected' : ''}>Text</option>
          </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      preConfirm: async () => {
        let updatedProcessName = document.getElementById('process-name').value;
        let updatedProcessType = document.getElementById('process-type').value;
        mutate({processID, updatedProcessName, updatedProcessType});
    },
  });}
return (
  <button className="ml-5 rounded-full bg-slate-200 hover:bg-slate-400 p-2" onClick={() => changeProcess(processID, processName, processType)}>Change</button>
);
};
function AddNewOperation({linkaId, refetchOperations}){
  const { status, error, mutate } = useMutation({
    mutationFn: ({linkaId, newOperationName}) => {
      return fetch(`http://${IP}:3005/createNewOperation`, {
        method: 'POST',
        body: JSON.stringify({LinkaId: linkaId, Operation_name: newOperationName, }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
    },
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'New Operation added successfully'
      });
      refetchOperations();
    },
    onError: () =>
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to add new Operation, something went wrong'
    })
  });

 const addNewProcess = () => {
  Swal.fire({
    title: 'Add new Operation',
    html: `
      <textarea id="operation-name" class="swal2-textarea" placeholder="Operation name" style="min-width: 350px; height: 100px; word-wrap: break-word;"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    preConfirm: async () => {
      let newOperationName = document.getElementById('operation-name').value;
       
       mutate({linkaId, newOperationName});
     },
   });
 };
 return (
   <button className="ml-5 rounded-full bg-slate-200 hover:bg-slate-400 p-2" onClick={addNewProcess}>+Add new Process</button>
 );
};

function DeleteOperation({operationId ,refetchOperations}){
  const { status, error, mutate } = useMutation({
    mutationFn: ({operationId}) => {
      return fetch(`http://${IP}:3005/deleteOperation`, {
        method: 'DELETE',
        body: JSON.stringify({Operation_id: operationId}),
        headers: {
            'Content-Type': 'application/json'
        }
    });
  },
  onSuccess: () => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Operation deleted successfully'
  });
    refetchOperations();
  },
  onError: () =>
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'Failed to delete operation, something went wrong'
  }),
});
const deleteProcess = () => {
  Swal.fire({
    title: `Are you sure you want to delete operation ID: ${operationId}`,
    text: "",
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    focusConfirm: false,
    preConfirm: async () => {
      mutate({operationId});
    },
  });
};


return (
  <button className="ml-5 mt-5 rounded-full bg-slate-200 hover:bg-slate-400 p-2" onClick={deleteProcess}>Delete Operation</button>

)};



function AdminConfig() {


    const { lineId } = useParams();
    const {status: operationsStatus, data: operations, refetch: refetchOperations} = useQuery({queryKey: ['operations'], queryFn: async () => await getOperations(IP, lineId), initialData: []});
    const {status: processesStatus, data: processes, refetch: refetchProcesses} = useQuery({queryKey: ['processes'], queryFn: async () => await getProcesses(IP, lineId), initialData: []});
    const {status: lineNameStatus, data: lineName} = useQuery({queryKey: ['lineName'], queryFn: async () => await getNameOfLine(IP, lineId), initialData: []});

   
        



        
if (operationsStatus === 'loading') {
    return <span>Loading...lineNameLoad</span>

} else if (processesStatus === 'loading') {
    return <span>Loading...processesLoad</span>

} else if (lineNameStatus === 'loading') {
    return <span>Loading...operationsLoad</span>
}

    return (        
        <div className="bg-slate-300 w-11/12 h-full flex flex-col">
            <div>
                {console.log(processes)}
                <h1 className="text-3xl pt-10 pb-10 text-center">{lineName.length > 0 ? lineName[0].PLine_name : 'N/A'}</h1>
            </div>
            {operations.map((operation) => {
                return (
                    <div className="bg-white flex flex-col border">
                        <div className="flex frex-row mb-5 mt-5 items-center">
                            <div className="bg-white">
                                <p className="bg-slate-200 text-xl p-2 ml-4">{operation.Operation_name}</p>
                                <DeleteOperation operationId={operation.Operation_id} refetchOperations={refetchOperations} />
                            </div>
                            <div className="ml-5 rounded-3xl p-3 border">
                                {processes.map((processGroup) => {
                                const filteredProcesses = processGroup.filter((process) => process.Operation_id_Operation === operation.Operation_id);
                                return filteredProcesses.map((process) => {
                                    return (
                                    <div className="w-full p-2">
                                        <a className="bg-white text underline underline-offset-4" id={process.Process_id}>{process.Process_name}</a>
                                        <a className="ml-5">{process.Process_type}</a>
                                        <ChangeProcess processID={process.Process_id} processName={process.Process_name} processType={process.Process_type} refetchProcesses={refetchProcesses} />
                                        <DeleteProcess processID={process.Process_id} refetchProcesses={refetchProcesses} />
                                    </div>
                                    );
                                });
                                })}
                                <AddNewProcess operationID={operation.Operation_id} refetchProcesses={refetchProcesses} />
                            </div>
                        </div>
                    </div>
                );
                })}
            <div className="pt-5 pl-5 pb-5 border">
                <AddNewOperation linkaId={lineId} refetchOperations={refetchOperations}/>
            </div>
        </div>
    );
}

export default AdminConfig;
