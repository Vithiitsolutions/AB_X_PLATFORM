import { Box, H1, Table, Tbody, Th, Tr, Td, Thead } from "@mercury-js/mess";
import React from "react";

export default function SalesCards() {
    const SalesHeaders = [
        { id: 1, header: "Entity" },
        { id: 2, header: "Date" },
        { id: 3, header: "Customer Name" },
        { id: 4, header: "Amount" },
        { id: 5, header: "Items" },
    ];

    const SalesData = [
        { id: 1, name: "Store A", date: "01-02-2025", customerName: "Vaishnav M", amount: "₹499", items: "--" },
        { id: 2, name: "Store A", date: "01-02-2025", customerName: "Vaishnav M", amount: "₹499", items: "--" },
        { id: 3, name: "Store A", date: "01-02-2025", customerName: "Vaishnav M", amount: "₹499", items: "--" },
    ];

    return (
        <Box styles={{
            base: {
                border:"1px solid #DDDDDD",
                borderRadius:"19.93px",
                padding:"10px 20px",
            }
        }}>
            <H1 styles={{
                base: `
                    font-size:25px;
                    font-weight:600;
                `
            }}>Sales</H1>
            
            <Table styles={{ base: `width: 100%; border-collapse: collapse;` }}>
                <Thead>
                    <Tr>
                        {SalesHeaders.map((header) => (
                            <Th key={header.id} styles={{ base: `border-bottom: 2px solid #DDDDDD; padding: 10px; text-align: left; font-weight: bold;` }}>
                                {header.header}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {SalesData.map((data) => (
                        <Tr key={data.id}>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.name}</Td>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.date}</Td>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.customerName}</Td>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.amount}</Td>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.items}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}
