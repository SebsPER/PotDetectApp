import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { deleteDoc, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import GlobalValues from '../../utils/GlobalValues.tsx';

export default function RegisterProyect({ navigation }) {

  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {

    try {
      console.log(nombre)
      console.log(foto)
      console.log(descripcion)
      console.log(GlobalValues.getEmpresaUID())

      const Proyecto = await addDoc(collection(db, 'Empresas', GlobalValues.getEmpresaUID(), 'Proyecto'), {
        Nombre: nombre,
        Descripcion: descripcion,
        Foto: foto,
        Contador: 0,
      });
      navigation.navigate('Proyect');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Proyecto</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        onChangeText={(text) => setNombre(text)}
        value={nombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Foto"
        onChangeText={(text) => setFoto(text)}
        value={foto}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripcion"
        onChangeText={(text) => setDescripcion(text)}
        value={descripcion}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleRegister}>
        <Text style={styles.createButtonText}>Crear</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
   createButton: {
      backgroundColor: 'rgb(40, 213, 133)',
      paddingVertical: 17,
      paddingHorizontal: 16,
      borderRadius: 4,
      marginBottom: 10,
      width:'100%'
    },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF6C5E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegisterProyect;
