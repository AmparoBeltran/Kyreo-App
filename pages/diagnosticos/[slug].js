import {
  firestore,
  serverTimestamp,
  postToJSON,
  auth,
} from "../../lib/firebase";
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
  HStack,
} from "@chakra-ui/react";
import DiagnosticItem from "../../components/DiagnosticItem";
import DiagnosticComments from "../../components/DiagnosticComments";

export default function DiagnosticPage(props) {
  return <DisplayDiagnostico />;
}

function DisplayDiagnostico() {
  const router = useRouter();
  const [createdAtDB, setCreatedAtDB] = useState(0);
  const [createdAt, setCreatedAt] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [username, setUsername] = useState("");
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

  const [authorUid, setAuthorUid] = useState("");

  const [isAuthor, setIsAuthor] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(`${username}-${patron}`));

  // Validate length
  const isValid = patron.length > 3 && patron.length < 100;

  useEffect(() => {
    document.body.classList.toggle("bg-diagnosticos");

    const diags = query(
      collectionGroup(firestore, "diagnosticos"),
      where("slug", "==", router.query.slug)
    );

    getDocs(diags).then((diags) => {
      diags.docs.forEach((diagnostico) => {
        const diag = postToJSON(diagnostico);

        setAuthorUid(diag.uid ?? "");
        setCreatedAtDB(diag._createdAt ?? "");
        setCreatedAt(diag.createdAt ?? "");
        setUpdatedAt(diag.updatedAt ?? "");
        setUsername(diag.username ?? "");
        setEdad(diag.edad ?? "");
        setGenero(diag.genero ?? "");
        setMotivoConsulta(diag.motivoConsulta ?? "");
        setObservaciones(diag.observaciones ?? "");
        setAntecedentes(diag.antecedentes ?? "");
        setSensaciones(diag.sensaciones ?? "");
        setSudor(diag.sudor ?? "");
        setDolor(diag.dolor ?? "");
        setHecesOrina(diag.hecesOrina ?? "");
        setAudicionVision(diag.audicionVision ?? "");
        setSueno(diag.sueno ?? "");
        setSedApetito(diag.sedApetito ?? "");
        setAlteracionesGine(diag.alteracionesGine ?? "");
        setProblemasInfant(diag.problemasInfant ?? "");
        setCapa(diag.capa ?? "");
        setCuerpoLingual(diag.cuerpoLingual ?? "");
        setObservacionesLengua(diag.observacionesLengua ?? "");
        setFoto(diag.foto ?? diag.fotoLenguaUpload ?? "");
        setObservacionesPulso(diag.observacionesPulso ?? "");
        setPatron(diag.patron ?? "");
        setPrincipioTerapeutico(diag.principioTerapeutico ?? "");
        setFormulaAcupuntural(diag.formulaAcupuntural ?? "");
        setEvolucionFormula(diag.evolucionFormula ?? "");
        setOtrasRecomendacionesFitoterapia(
          diag.otrasRecomendacionesFitoterapia
        );
        setFitoterapia(diag.fitoterapia ?? "");
        setDiagnosticoAlopatico(diag.diagnosticoAlopatico ?? "");
        setObservacionesAlopatico(diag.observacionesAlopatico ?? "");

        if (diag.username === auth.currentUser.displayName) {
          setIsAuthor(true);
        }
      });
      // setDiagnosticos(diags.docs.map(postToJSON));
    });

    return () => {
      document.body.classList.toggle("bg-diagnosticos");
    };
  }, [router.query.slug]);

  const updatePost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("diagnosticos")
      .doc(router.query.slug);

    // Tip: give all fields a default value here
    const data = {
      slug,
      uid,
      username,
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

    await ref.update(data);
    setIsReadOnly(true);

    toast.success("Diagnostico editado!");

    // Imperative navigation after doc is set
    router.push(`/diagnosticos/${slug}`);
  };

  return (
    <Box>
      <Box
        p={16}
        bgColor={"#d5eaef91"}
        boxShadow="md"
        borderRadius="lg"
        mt={-12}
        border="none"
      >
        <VStack as="form" spacing={12}>
          <DiagnosticItem
            width="100%"
            disableLink={true}
            data={{
              username,
              patron,
              slug: router.query.slug,
              updatedAt,
              createdAt,
            }}
          />
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
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Edad</FormLabel>
                    <NumberInput
                      onChange={(valueString) => setEdad(valueString)}
                      value={edad}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Genero</FormLabel>
                    <Input
                      onChange={(event) => setGenero(event.target.value)}
                      value={genero}
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Motivo de la consulta</FormLabel>
                    <Textarea
                      value={motivoConsulta}
                      onChange={(event) =>
                        setMotivoConsulta(event.target.value)
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
                    Observaciones
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack>
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Antecedentes</FormLabel>
                    <Textarea
                      value={antecedentes}
                      onChange={(event) => setAntecedentes(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Sensaciones frío-calor</FormLabel>
                    <Textarea
                      value={sensaciones}
                      onChange={(event) => setSensaciones(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Sudor</FormLabel>
                    <Textarea
                      value={sudor}
                      onChange={(event) => setSudor(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Dolor</FormLabel>
                    <Textarea
                      value={dolor}
                      onChange={(event) => setDolor(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Heces y orina</FormLabel>
                    <Textarea
                      value={hecesOrina}
                      onChange={(event) => setHecesOrina(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Audición y visión</FormLabel>
                    <Textarea
                      value={audicionVision}
                      onChange={(event) =>
                        setAudicionVision(event.target.value)
                      }
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Sueño</FormLabel>
                    <Textarea
                      value={sueno}
                      onChange={(event) => setSueno(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Sed y apetito</FormLabel>
                    <Textarea
                      value={sedApetito}
                      onChange={(event) => setSedApetito(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Problemas infantiles</FormLabel>
                    <Textarea
                      value={problemasInfant}
                      onChange={(event) =>
                        setProblemasInfant(event.target.value)
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
                    Lengua
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Capa</FormLabel>
                    <Textarea
                      value={capa}
                      onChange={(event) => setCapa(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Cuerpo lingual</FormLabel>
                    <Textarea
                      value={cuerpoLingual}
                      onChange={(event) => setCuerpoLingual(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Foto</FormLabel>
                    {foto.length > 0 && (
                      <Image
                        src={foto}
                        boxSize="lg"
                        objectFit={"contain"}
                        alt="Foto Lengua"
                      />
                    )}
                  </FormControl>
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
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl
                    isReadOnly={isReadOnly}
                    isRequired
                    isInvalid={!isValid}
                  >
                    <FormLabel>Patrón</FormLabel>
                    <Textarea
                      value={patron}
                      onChange={(event) => setPatron(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                    {!isValid && (
                      <FormHelperText>Patrón necesario</FormHelperText>
                    )}
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
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
                    <FormLabel>Fitoterapia</FormLabel>
                    <Textarea
                      value={fitoterapia}
                      onChange={(event) => setFitoterapia(event.target.value)}
                      placeholder=""
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
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
                  <FormControl isReadOnly={isReadOnly}>
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
          <HStack>
            <DiagnosticComments diagAuthorUid={authorUid} />
            {isAuthor &&
              (isReadOnly ? (
                <Button
                  // size="sm"
                  colorScheme="linkedin"
                  variant="solid"
                  onClick={() => setIsReadOnly(false)}
                >
                  Editar
                </Button>
              ) : (
                <Button
                  // size="sm"
                  colorScheme="linkedin"
                  variant="solid"
                  onClick={updatePost}
                  isDisabled={!isValid}
                >
                  Guardar
                </Button>
              ))}
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
