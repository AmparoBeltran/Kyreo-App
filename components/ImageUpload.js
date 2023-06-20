import { FormControl, FormLabel } from "@chakra-ui/react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../lib/firebase";

export default function ImageUpload(props) {
  function handleImageUpload(event) {
    const file = event.target.files[0]

    const storageRef = ref(storage, `${props.path}/${props.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
      (snapshot) => {
        
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          props.setFoto(downloadURL)
        });
      }
    );

    console.log(event);
  }
  return (
    <FormControl>
      <FormLabel>Foto</FormLabel>
      <input accept=".png,.jpg,.jpeg" ref={props.inputRef} type="file" onChange={handleImageUpload} />
    </FormControl>
  );
}
