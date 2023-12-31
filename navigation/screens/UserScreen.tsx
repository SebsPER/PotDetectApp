import * as React from 'react';
import { View, Icon, Image, Text, Button, FlatList, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { getAuth, signOut } from 'firebase/auth'; // Importa las funciones necesarias de Firebase Authentication
import { auth } from '../../firebaseConfig';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import GlobalValues from '../../utils/GlobalValues.tsx';


export default function UserScreen({ navigation }) {
  //const auth = getAuth(); // Obtiene la instancia de autenticación de Firebase
  const [users, setUsers] = React.useState([]);
  const [modalAgre, setModalAgre] = React.useState(false);
  const [modalLog, setModalLog] = React.useState(false);
  const [logged, setLogged] = React.useState(false);
  const [logUser, setLogUser] = React.useState("");
  const [newNom, setNewNom] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [nom, setNom] = React.useState("");
  const [pwd, setPwd] = React.useState("");
  const [newPerm, setNewPerm] = React.useState("");
  const [modalVisible, setModalVisible] = React.useState(false);
  const [valid, setValid] = React.useState(false);

  React.useEffect(() => {
    console.log("useefetc")
    const getList = async () => {
      const fetchedList = await fetchListFromFirestore();
      setUsers(fetchedList);
    };
    getList();

  }, [valid]);

  const fetchListFromFirestore = async () => {
    console.log("entro");
    ///para pruebas
    //const querySnapshot = await getDocs(collection(db, "Proyectos"));

    const usData = await getDocs(collection(db, 'Empresas', GlobalValues.getEmpresaUID(), 'Usuarios'));

    const users = []
    usData.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.Nombre,
        priv: data.Permisos,
        contra: data.Contrasena
      });
    });
    return users
  };

  const handleDeleteProject = async (projectId) => {
    //const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este proyecto?');

    if (GlobalValues.getLogged()) {
      alert("Ingresa tus credenciales de usuario antes de eliminar un proyecto")
      return
    } else if (GlobalValues.getPermisos()) {
      alert("No tienes los permisos necesarios para eliminar un proyecto")
      return
    }

    if (/*confirmDelete*/true) {
      try {
        const proyectref = doc(db, 'Empresas', GlobalValues.getEmpresaUID(), 'Usuarios', projectId);
        await deleteDoc(proyectref);


        const user = users.filter((project) => project.id !== projectId);
        setUsers(user);
        setValid(!valid);

      } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      GlobalValues.setWorkProyectoName('')
      await signOut(auth); // Cierra la sesión del usuario actual
      navigation.navigate('Login'); // Redirecciona a la pantalla de inicio de sesión (Login)
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleItemClick = (item) => {
    setModalLog(true);
    setNom(item.name);
  };

  const getPrivilegeLabel = (privValue) => {
    if (privValue === 0) {
      return "Empleado";
    } else if (privValue === 1) {
      return "Admin";
    }
    // Puedes agregar más casos si es necesario
    return "Desconocido";
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemClick(item)}>
      <View style={styles.projectItem}>
        <Image source={require('../../assets/gridicons_user.png')} style={styles.projectImage} />
        <View style={styles.projectInfo}>
          <Text style={styles.projectCounter}>{item.name}</Text>
          <Text style={styles.projectName}>{getPrivilegeLabel(item.priv)}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteProject(item.id)}>
          <Ionicons name="trash-outline" size={24} color="rgb(237, 127, 120)" />
        </TouchableOpacity>
      </View>


    </TouchableOpacity>
  );

  const handleCreateUser = () => {
    if (GlobalValues.getLogged()) {
      alert("Ingresa tus credenciales de usuario antes de agregar un empleado")
      return
    } else if (GlobalValues.getPermisos()) {
      alert("No tienes los permisos necesarios para agregar un empleado")
      return
    }
    setModalAgre(true);
  };

  const addWorker = async () => {
    console.log(GlobalValues.getEmpresaUID());
    const docRef = await addDoc(collection(db, "Empresas", GlobalValues.getEmpresaUID(), "Usuarios"), {
      Nombre: newNom,
      Contrasena: newPwd,
      Permisos: parseInt(newPerm)
    });
    const fetchedList = await fetchListFromFirestore();
    setValid(!valid);
    setUsers(fetchedList);
  };

  const checkCreds = async () => {
    const q = query(collection(db, "Empresas", GlobalValues.getEmpresaUID(), "Usuarios"), where('Nombre', '==', nom), where('Contrasena', '==', pwd));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Contraseña equivocada")
      setLogUser("");
      GlobalValues.setEmpleadoName("");
      GlobalValues.setEmpleadoId("");
      GlobalValues.setPermisos(0);
    } else {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        setLogged(true);
        setLogUser(doc.data().Nombre);
        GlobalValues.setEmpleadoName(doc.data());
        GlobalValues.setEmpleadoId(doc);
        GlobalValues.setPermisos(doc.data());
        GlobalValues.setLogged();
      });

    }
    console.log(GlobalValues.getPermisos());
    setNom("");
    setPwd("");
  };

  const handleAgregarEmpleado = () => {
    setModalVisible(true);
  };

  const handleGuardarEmpleado = () => {
    // Aquí puedes agregar la lógica para guardar el empleado en tu base de datos o realizar otras acciones necesarias.
    // Por ahora, simplemente cerramos el modal.
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType='fade'
        transparent={true}
        visible={modalAgre}
        onRequestClose={() => {
          alert("Cerro el modal");
        }}>
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Agregar Nuevo Empleado</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#B4B4B4"
              onChangeText={(text) => setNewNom(text)}
              value={newNom}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#B4B4B4"
              onChangeText={(text) => setNewPwd(text)}
              value={newPwd}
            />
            <TextInput
              style={styles.input}
              placeholder="Permisos (0 o 1)"
              placeholderTextColor="#B4B4B4"
              onChangeText={(text) => setNewPerm(text)}
              value={newPerm}
            />


             <View style={{ flexDirection: 'row', justifyContent: "space-evenly" }}>
                                                  <TouchableOpacity style={{ width: '47%', height: 50, borderWidth: 1, marginRight:0, alignSelf: 'flex-start', borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: "white", borderColor: 'rgb(40, 213, 133)' }}
                                                    onPress={() => setModalAgre(!modalAgre)}>
                                                    <Text style={{ color: 'rgb(40, 213, 133)' }}>Cerrar</Text>
                                                  </TouchableOpacity>
                                                  <TouchableOpacity style={{ width: '47%', height: 50, borderWidth: 1,marginLeft:10, alignSelf: 'flex-start', borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(40, 213, 133)', borderColor: 'rgb(40, 213, 133)' }}
                                                    onPress={() => {
                                                                    addWorker()
                                                                    setModalAgre(!modalAgre)
                                                                  }}
                                                                >
                                                    <Text style={{ color: "white" }}>Ingresar</Text>
                                                  </TouchableOpacity>
                                                </View>

          </View>
        </View>
      </Modal>
      <Modal
        animationType='fade'
        transparent={true}
        visible={modalLog}
        onRequestClose={() => {
          alert("Cerro el modal");
        }}>


        <View style={styles.modalBackground}>
          <View style={styles.modalViewUser}>
            <Text style={styles.modalTitle}>Ingresa tus credenciales</Text>

            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#B4B4B4"
              onChangeText={(text) => setPwd(text)}
              value={pwd}
            />

             <View style={{ flexDirection: 'row', justifyContent: "space-evenly" }}>
                                      <TouchableOpacity style={{ width: '47%', height: 50, borderWidth: 1, marginRight:0, alignSelf: 'flex-start', borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: "white", borderColor: 'rgb(40, 213, 133)' }}
                                        onPress={() => setModalLog(!modalLog)}>
                                        <Text style={{ color: 'rgb(40, 213, 133)' }}>Cerrar</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={{ width: '47%', height: 50, borderWidth: 1,marginLeft:10, alignSelf: 'flex-start', borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(40, 213, 133)', borderColor: 'rgb(40, 213, 133)' }}
                                        onPress={() => {
                                                        checkCreds()
                                                        setModalLog(!modalLog)
                                                      }}
                                                    >
                                        <Text style={{ color: "white" }}>Ingresar</Text>
                                      </TouchableOpacity>
                                    </View>

          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Empleados</Text>
        
      </View>
      <FlatList
        style={{ marginTop: 15, marginHorizontal: 10 }}
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity onPress={handleCreateUser} style={styles.createButton}>
        <Text style={styles.createButtonText}>Agregar Empleado</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut} style={styles.cerrarbtn}>
          <Text style={styles.cerrar}>Cerrar Sesion</Text>

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: 'rgb(40, 213, 133)',
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 10,
  },

  cerrarbtn: {
    backgroundColor: 'rgb(237, 127, 120)',
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 10,
  },

  cerrar: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  projectCounter: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalContent: {
    flex: 1,
  },

  modalBackground: {
  //margintop:20,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semiopaco
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Estilos para el contenedor del nombre y priv
    // ...otros estilos si los tienes
  },
  privContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // Estilos para el contenedor de priv y el botón de eliminación
    // ...otros estilos si los tienes
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 30
  },
  modalView: {
    //flex: 1,
    //justifyContent: 'center', // Centrar verticalmente
    alignItems: 'center', // Centrar horizontalmente
    //maxHeight: 300, // Ajusta este valor según tus necesidades
    //marginHorizontal:15,
    //marginVertical:70,
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalViewUser: {
    //flex: 1,
    //justifyContent: 'center', // Centrar verticalmente
    alignItems: 'center', // Centrar horizontalmente
    //maxHeight: 150, // Ajusta este valor según tus necesidades
    //marginHorizontal:15,
    //marginVertical:70,
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  ModalAgreTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FF6C5E'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  cancelButton: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 0,
    borderRadius: 5,
    color: '#B4B4B4'
  },
  addButton: {
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#67A25A'
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flexDirection: 'row',
    backgroundColor: "#f5f5f5",
    borderBottomColor: "#f5f5f5",
    borderBottomWidth: 1,
    padding: 15,
    width: 350,
    justifyContent: 'space-between',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
