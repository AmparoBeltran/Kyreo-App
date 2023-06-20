import { VStack } from '@chakra-ui/react'
import NavLinkMobile from './NavLinkMobile';

export default function NavLinksMobile() {
    return (
        <VStack>
            <NavLinkMobile
                label="Inicio"
                path="/"
            />

            <NavLinkMobile
                label="Formulario"
                path="/diagnosticos/create"
            />
            <NavLinkMobile
                label="Diagnósticos"
                path="/diagnosticos"
            />
            <NavLinkMobile
                label="Biblioteca"
                path="/biblioteca"
            />
            <NavLinkMobile
                label="Logout"
                path="#"
            />
        </VStack>
    )
}
