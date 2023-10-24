import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Pressable, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import RNPickerSelect from 'react-native-picker-select';
import GlobalValues from '../../utils/GlobalValues.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [selectedProyectoName, setSelectedProyectoName] = useState("Selecciona un Proyecto");

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalAgre, setModalAgre] = React.useState(false);

  const [grieta, setGrietas] = useState(0);
  const [hueco, setHueco] = useState(0);
  const [huecoGrave, setHuecoGrave] = useState(0);
  const [description, setDescription] = useState("");
  const [foto, setFoto] = useState("");
  const [Usuario, setUserName] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  var proy = GlobalValues.getWorkProyecto();
  var noChange = GlobalValues.getRefresh();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useFocusEffect(
    useCallback(() => {
      // Tu código aquí que se ejecutará cuando cambie 'proy'
      const proyectos = async () => {
        const proyectosData = await fetchListFromFirestore();
        setProjects(proyectosData);
      };

      proyectos();
    }, [noChange])
  );
  useFocusEffect(
    useCallback(() => {
      // Tu código aquí que se ejecutará cuando cambie 'noChange'
      const fetchLocations = async () => {
        const fetchedLocations = await fetchLocationsFromFirestore(GlobalValues.getWorkProyecto(true));
        setLocations(fetchedLocations);
      };

      fetchLocations();
    }, [proy])
  );

  const fetchListFromFirestore = async () => {
    //console.log("entro");
    ///para pruebas
    //const querySnapshot = await getDocs(collection(db, "Proyectos"));

    const Proyecto = await getDocs(collection(db, 'Empresas', GlobalValues.getEmpresaUID(), 'Proyecto'));

    const projects = []
    Proyecto.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.Nombre,
      });
    });
    return projects
  };

  const fetchLocationsFromFirestore = async (proyectoUid) => {

    const querySnapshot = await getDocs(collection(db, 'Empresas', GlobalValues.getEmpresaUID(), 'Proyecto', proyectoUid, 'Registro'));
    const locations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // console.log(doc.title);
      // console.log(data.latitude);
      // console.log(data.longitude);
      // console.log(data.description);
      locations.push({
        title: data.title,
        Grieta: data.Grietas,
        Hueco: data.Huecos,
        HuecoGrave: data.HuecosGraves,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        description: data.description,
        foto: data.Url,
        Usuario: data.Usuario
      });
    });
    return locations;
  };

  const onProyectoSelect = async (proyectoData) => {
    GlobalValues.setProyectoUID(proyectoData.id);
    setSelectedProyecto(proyectoData.id);
    GlobalValues.setProyectoUID(proyectoData.id);
    GlobalValues.setWorkProyecto(proyectoData);
    setIsOpen(false); // Cierra el menú desplegable al seleccionar un proyecto
    const fetchedLocations = await fetchLocationsFromFirestore(GlobalValues.getWorkProyecto(true));
    setLocations(fetchedLocations);
  };

  const onRegionChange = (region) => {
    //console.log(region);
  };

  const handleCreateUser = (Grietaa, Huecoo, HuecoGravee, descriptionn, fotoo, Usuario) => {
    setGrietas(Grietaa)
    setHueco(Huecoo)
    setHuecoGrave(HuecoGravee)
    setDescription(descriptionn)
    setFoto(fotoo)
    setUserName(Usuario)

    console.log("Grieta", grieta)
    console.log("Huecos", hueco)
    console.log("HuecoGrave", huecoGrave)
    console.log("foto", foto)
    setModalAgre(true);
  };

  const modalOnClose = () => {
    setIsModalVisible(false);
  };

  const handleItemClick = (item) => {
    console.log(item.id)
    GlobalValues.setProyectoUID(item.id)
    GlobalValues.setWorkProyecto(item);
    onProyectoSelect(item);
  };

  const renderProyList = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemClick(item)}>
      <View style={styles.list}>
        <Text style={{color: '#101651' }}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalAgre}
        onRequestClose={() => {
          alert("Cerro el modal");
        }}>
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Datos del daño</Text>
            <Text style={styles.dato}>Grietas: {grieta}</Text>
            <Text style={styles.dato}>Huecos: {hueco}</Text>
            <Text style={styles.dato}>Huecos Graves: {huecoGrave}</Text>
            <Text style={styles.dato}>Empleado: {Usuario}</Text>
            <Image
              source={{ uri: foto }}
              style={styles.modalImage}
            />
            <Pressable style={styles.button}
              onPress={() => setModalAgre(!modalAgre)}
            >
              <Text style={styles.cancelButton}>Cancelar</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Filtrar por Proyecto</Text>
            <Pressable onPress={modalOnClose}>
              <Ionicons name={"close"} size={22} color={"#101651"} />
            </Pressable>
          </View>
          <FlatList
            style={{ marginTop: 10, marginHorizontal: 10 }}
            data={projects}
            renderItem={renderProyList}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() =>{setIsModalVisible(true)}} style={styles.filterButton}>
          <Text style={{fontSize:14, color:"white", fontFamily:"Arial"}}>Filtrar <Ionicons name="md-filter" size={18} color="white" /></Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        onRegionChange={onRegionChange}
        initialRegion={{
          latitude: -11.969071010202395,
          latitudeDelta: 1.5772551319534536,
          longitude: -76.90717739984393,
          longitudeDelta: 0.9701124206185341,
        }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={true ? mapStyle : null}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            coordinate={location.location}
            onPress={() => handleCreateUser(location.Grieta, location.Hueco, location.HuecoGrave, location.description, location.foto, location.Usuario)}
            image={require('../../assets/fluent_location-16-filled.png')}
          >
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: 600, // Ancho deseado de la imagen
    height: 600, // Altura deseada de la imagen
    resizeMode: 'contain', // Puedes ajustar el modo de redimensionamiento según tus necesidades
    borderRadius: 10, // Bordes redondeados u otros estilos según prefieras
  },
  modalView: {
    flex: 1,
    justifyContent: 'center', // Centrar verticalmente
    alignItems: 'center', // Centrar horizontalmente
    //maxHeight: 330, // Ajusta este valor según tus necesidades
    //marginHorizontal:15,
    //marginVertical:70,
    margin: 20,
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
  addButton: {
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#67A25A'
  },

  cancelButton: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 0,
    borderRadius: 5,
    color: '#B4B4B4'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },

  ModalAgreTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FF6C5E'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semiopaco
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  createButton: {
    backgroundColor: '#FF6C5E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  dropdownContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  filterContainer: {
    position: 'absolute',
    backgroundColor: '#28D585',
    top: "8%",
    width: "22%",
    height: "5%",
    borderRadius: 100,
    elevation: 2,
    zIndex: 1,
  },
  filterButton: {
    flex: 1,
    flexDirection:"row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  modalContent: {
    height: '35%',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: '16%',
    backgroundColor: '#F5F5F5',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#101651',
    fontFamily:"Arial",
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 20,
  },
  list: {
    flexDirection: 'row',
    padding: 15,
    width: "100%",
    justifyContent: 'center',
  },
});

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#F5F5F1",
      },
    ],
  },
  {
    elementType: "geometry.fill",
    stylers: [
      {
        saturation: -5,
      },
      {
        lightness: -5,
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  // {
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#757575",
  //     },
  //   ],
  // },
  // {
  //   elementType: "labels.text.stroke",
  //   stylers: [
  //     {
  //       color: "#212121",
  //     },
  //   ],
  // },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  // {
  //   featureType: "administrative.country",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#9E9E9E",
  //     },
  //   ],
  // },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  // {
  //   featureType: "administrative.locality",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#BDBDBD",
  //     },
  //   ],
  // },
  // {
  //   featureType: "poi",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#757575",
  //     },
  //   ],
  // },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#CFEFD6",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  // {
  //   featureType: "poi.park",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#616161",
  //     },
  //   ],
  // },
  // {
  //   featureType: "poi.park",
  //   elementType: "labels.text.stroke",
  //   stylers: [
  //     {
  //       color: "#1B1B1B",
  //     },
  //   ],
  // },
  {
    featureType: "road",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#FFFFFF",
      },
    ],
  },
  // {
  //   featureType: "road",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#8A8A8A",
  //     },
  //   ],
  // },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#FFFFFF",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#FFFFFF",
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#FFFFFF",
      },
    ],
  },
  // {
  //   featureType: "road.local",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#616161",
  //     },
  //   ],
  // },
  // {
  //   featureType: "transit",
  //   elementType: "labels.text.fill",
  //   stylers: [
  //     {
  //       color: "#757575",
  //     },
  //   ],
  // },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#B1E1F7",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3D3D3D",
      },
    ],
  },
];