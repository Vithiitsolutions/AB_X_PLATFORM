import { Box, H1, Table, Tbody, Th, Tr, Td, Thead } from "@mercury-js/mess";
import React from "react";

export default function PurchasesCards() {
    const PurchasesHeaders = [
        { id: 1, header: "Entity" },
        { id: 2, header: "Date" },
        { id: 4, header: "Amount" },
    ];

    const PurchasesData = [
        { id: 1, name: "Store A", date: "01-02-2025",  amount: "₹499",  },
        { id: 2, name: "Store A", date: "01-02-2025",  amount: "₹499",  },
        { id: 3, name: "Store A", date: "01-02-2025",  amount: "₹499",  },
    ];

    return (
        <Box styles={{
            base: `
                border:1px solid #DDDDDD;
                border-radius:19.93px;
                padding:10px 20px;
            `
        }}>
            <H1 styles={{
                base: `
                    font-size:25px;
                    font-weight:600;
                `
            }}>Purchases</H1>
            
            <Table styles={{ base: `width: 100%; border-collapse: collapse;` }}>
                <Thead>
                    <Tr>
                        {PurchasesHeaders.map((header) => (
                            <Th key={header.id} styles={{ base: `border-bottom: 2px solid #DDDDDD; padding: 10px; text-align: left; font-weight: bold;` }}>
                                {header.header}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {PurchasesData.map((data) => (
                        <Tr key={data.id}>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.name}</Td>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.date}</Td>
                            <Td styles={{ base: `padding: 10px; ` }}>{data.amount}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}
