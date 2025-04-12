import React, { useState } from 'react'
import CustomeButton from '../Button'
import { Box } from '@mercury-js/mess'

function TestCard() {
    const [state,setState]=useState("")
  return (
    <div style={{color:"black" ,width:"100%"}}>
        <Box>Managed Componet</Box>
         <textarea
                          placeholder={"Comment"}
                          className="border border-gray-300 rounded-md p-2 w-full h-24"
                        />
                        <CustomeButton  children="Managed Button" onClick={()=>alert("")}/>
    </div>
  )
}

export default TestCard