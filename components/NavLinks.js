import { HStack, Flex } from '@chakra-ui/react'
import NavLink from './NavLink';

export default function NavLinks() {
    return (
        <HStack>
            <NavLink
                label="Inicio"
                path="/"
            />

            <NavLink
                label="Formulario"
                path="/diagnosticos/create"
            />
            <NavLink
                label="Diagnósticos"
                path="/diagnosticos"
            />
            <NavLink
                label="Biblioteca"
                path="/biblioteca"
            />
            <NavLink
                label="Logout"
                path="#"
            />
        </HStack>
    )
}

// export default function NavLinks() {
//     return (
//         <HStack>
//             <Flex w="full" alignItems="center" justifyContent="space-around" px={6}>
//                 <a href='#'>Inicio</a>
//             </Flex>

//             <Flex w="full" alignItems="center" justifyContent="space-around" px={6}>
//                 <a href='#'>Formulario</a>
//             </Flex>

//             <Flex w="full" alignItems="center" justifyContent="space-around" px={6}>
//                 <a href='#'>Diagnósticos</a>
//             </Flex>

//             <Flex w="full" alignItems="center" justifyContent="space-around" px={6}>
//                 <a href='#'>Biblioteca</a>
//             </Flex>

//             <Flex border={'1px solid black'} w="full" alignItems="center" justifyContent="space-around" px={6}>
//                 <a href='#'>Login</a>
//             </Flex>
//         </HStack>
//     )
// }