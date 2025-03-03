import { Box, Button, Text } from '@mercury-js/mess';
import React, { useState } from 'react'
import { useTheme } from '../utils/theme';
import DynamicTable from '../components/table';
import PopUp from '../components/popup';

const dashboard = () => {
  const { theme } = useTheme();
  const [popupOpen,setPopupOpen]=useState(false)
  const onclosePopUp=()=>{
    setPopupOpen(false)
  }
  const data = [
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
  ];
  return (
    <Box
   
  >
<DynamicTable data={data} />
<Button onClick={()=>    setPopupOpen(true)
}>Popup</Button>
<PopUp isOpen={popupOpen} onClose={onclosePopUp} ><DynamicTable data={data} />
</PopUp>
  </Box>
  )
}

export default dashboard;