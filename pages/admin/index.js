import { firestore, auth, serverTimestamp } from "../../lib/firebase";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  NumberInput,
  NumberInputField,
  Textarea,
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  Image,
  FormHelperText,
} from "@chakra-ui/react";
import ImageUpload from "../../components/ImageUpload";

export default function AdminPostsPage() {
  useEffect(() => {
    document.body.classList.toggle("bg-diagnosticos");
    return () => {
      document.body.classList.toggle("bg-diagnosticos");
    };
  }, []);

  return <CreateNewPost />;
}

function CreateNewPost() {
  const router = useRouter();
  const username = auth.currentUser.displayName;
  const [edad, setEdad] = useState("");
  const [genero, setGenero] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [sensaciones, setSensaciones] = useState("");
  const [sudor, setSudor] = useState("");
  const [dolor, setDolor] = useState("");
  const [hecesOrina, setHecesOrina] = useState("");
  const [audicionVision, setAudicionVision] = useState("");
  const [sueno, setSueno] = useState("");
  const [sedApetito, setSedApetito] = useState("");
  const [alteracionesGine, setAlteracionesGine] = useState("");
  const [problemasInfant, setProblemasInfant] = useState("");
  const [capa, setCapa] = useState("");
  const [cuerpoLingual, setCuerpoLingual] = useState("");
  const [observacionesLengua, setObservacionesLengua] = useState("");
  const [foto, setFoto] = useState("");
  const [observacionesPulso, setObservacionesPulso] = useState("");
  const [patron, setPatron] = useState("");
  const [principioTerapeutico, setPrincipioTerapeutico] = useState("");
  const [formulaAcupuntural, setFormulaAcupuntural] = useState("");
  const [evolucionFormula, setEvolucionFormula] = useState("");
  const [fitoterapia, setFitoterapia] = useState("");
  const [otrasRecomendacionesFitoterapia, setOtrasRecomendacionesFitoterapia] =
    useState("");
  const [diagnosticoAlopatico, setDiagnosticoAlopatico] = useState("");
  const [observacionesAlopatico, setObservacionesAlopatico] = useState("");

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(`${username}-${patron}`));

  // Validate length
  const isValid = patron.length > 3 && patron.length < 100;

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();

    if (isValid) {
      toast.error("Patrón necesario");
      return;
    }

    const uid = auth.currentUser.uid;
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("diagnosticos")
      .doc(slug);

    // Tip: give all fields a default value here
    const data = {
      slug,
      uid,
      username,
      published: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      edad,
      genero,
      motivoConsulta,
      observaciones,
      antecedentes,
      sensaciones,
      sudor,
      dolor,
      hecesOrina,
      audicionVision,
      sueno,
      sedApetito,
      alteracionesGine,
      problemasInfant,
      capa,
      cuerpoLingual,
      observacionesLengua,
      foto,
      observacionesPulso,
      patron,
      principioTerapeutico,
      formulaAcupuntural,
      evolucionFormula,
      fitoterapia,
      otrasRecomendacionesFitoterapia,
      diagnosticoAlopatico,
      observacionesAlopatico,
    };

    await ref.set(data);

    toast.success("Diagnostico creado!");

    // Imperative navigation after doc is set
    router.push(`/diagnosticos/${slug}`);
  };

  return (
    <Box
      p={[8, 8, 16]}
      bgColor={"#d5eaef91"}
      boxShadow="md"
      borderRadius="lg"
      border="none"
      overflowY={"scroll"}
      height="full"
    >
      <VStack as="form" onSubmit={createPost} spacing={12}>
        <Accordion width="100%" variant="custom" allowToggle allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Datos Generales
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Edad</FormLabel>
                  <NumberInput
                    onChange={(valueString) => setEdad(valueString)}
                    value={edad}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Genero</FormLabel>
                  <Input
                    onChange={(event) => setGenero(event.target.value)}
                    value={genero}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Motivo de la consulta</FormLabel>
                  <Textarea
                    value={motivoConsulta}
                    onChange={(event) => setMotivoConsulta(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Observaciones
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Observaciones</FormLabel>
                  <Textarea
                    value={observaciones}
                    onChange={(event) => setObservaciones(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Síntomas y signos
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Antecedentes</FormLabel>
                  <Textarea
                    value={antecedentes}
                    onChange={(event) => setAntecedentes(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Sensaciones frío-calor</FormLabel>
                  <Textarea
                    value={sensaciones}
                    onChange={(event) => setSensaciones(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Sudor</FormLabel>
                  <Textarea
                    value={sudor}
                    onChange={(event) => setSudor(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Dolor</FormLabel>
                  <Textarea
                    value={dolor}
                    onChange={(event) => setDolor(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Heces y orina</FormLabel>
                  <Textarea
                    value={hecesOrina}
                    onChange={(event) => setHecesOrina(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Audición y visión</FormLabel>
                  <Textarea
                    value={audicionVision}
                    onChange={(event) => setAudicionVision(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Sueño</FormLabel>
                  <Textarea
                    value={sueno}
                    onChange={(event) => setSueno(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Sed y apetito</FormLabel>
                  <Textarea
                    value={sedApetito}
                    onChange={(event) => setSedApetito(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Alteraciones ginecológicas</FormLabel>
                  <Textarea
                    value={alteracionesGine}
                    onChange={(event) =>
                      setAlteracionesGine(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Problemas infantiles</FormLabel>
                  <Textarea
                    value={problemasInfant}
                    onChange={(event) => setProblemasInfant(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Lengua
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Capa</FormLabel>
                  <Textarea
                    value={capa}
                    onChange={(event) => setCapa(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Cuerpo lingual</FormLabel>
                  <Textarea
                    value={cuerpoLingual}
                    onChange={(event) => setCuerpoLingual(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Observaciones</FormLabel>
                  <Textarea
                    value={observacionesLengua}
                    onChange={(event) =>
                      setObservacionesLengua(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                {foto.length > 0 && (
                  <Image
                    src={foto}
                    boxSize="lg"
                    objectFit={"contain"}
                    alt="Foto Lengua"
                  />
                )}
                <ImageUpload
                  setFoto={setFoto}
                  uid={auth.currentUser.uid}
                  path={"diagnosticos/fotosLengua"}
                />
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Pulso
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Observaciones</FormLabel>
                  <Textarea
                    value={observacionesPulso}
                    onChange={(event) =>
                      setObservacionesPulso(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Patrón de desequilibrio
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl isRequired isInvalid={!isValid}>
                  <FormLabel>Patrón</FormLabel>
                  <Textarea
                    value={patron}
                    onChange={(event) => setPatron(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                  {!isValid && <FormHelperText>Patrón necesario</FormHelperText>}
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Principio terapéutico
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Principio terapeutico</FormLabel>
                  <Textarea
                    value={principioTerapeutico}
                    onChange={(event) =>
                      setPrincipioTerapeutico(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Fórmula acupuntural
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Fórmula acupuntural</FormLabel>
                  <Textarea
                    value={formulaAcupuntural}
                    onChange={(event) =>
                      setFormulaAcupuntural(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Evolución / Cambios en fórmula</FormLabel>
                  <Textarea
                    value={evolucionFormula}
                    onChange={(event) =>
                      setEvolucionFormula(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Fitoterapia y otras recomendaciones
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Fitoterapia</FormLabel>
                  <Textarea
                    value={fitoterapia}
                    onChange={(event) => setFitoterapia(event.target.value)}
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Otras Recomendaciones</FormLabel>
                  <Textarea
                    value={otrasRecomendacionesFitoterapia}
                    onChange={(event) =>
                      setOtrasRecomendacionesFitoterapia(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Otros
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack>
                <FormControl>
                  <FormLabel>Diagnóstico alopático / Medicación</FormLabel>
                  <Textarea
                    value={diagnosticoAlopatico}
                    onChange={(event) =>
                      setDiagnosticoAlopatico(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Otras Observaciones</FormLabel>
                  <Textarea
                    value={observacionesAlopatico}
                    onChange={(event) =>
                      setObservacionesAlopatico(event.target.value)
                    }
                    placeholder=""
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Button
          // size="sm"
          colorScheme="linkedin"
          variant="solid"
          type="submit"
          isDisabled={!isValid}
        >
          Guardar
        </Button>
      </VStack>
    </Box>
  );
}
