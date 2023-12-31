class GlobalValues {
  static values = {
    proyectoUID: null,
    list_proyectoUID: null,
    work_proyectoUID: null,
    work_proyectoName: null,
    empresaUID: null,
    otroValor: null,
    empleadoName: null,
    empleadoID: null,
    permisos: true,
    logged: true,
    refresh: false,
    // Agrega más valores globales según tus necesidades
  };
  static getProyectoUIDD() {
    return this.values.proyectoUID;
  }

  static setProyectoUIDD(uid) {
    this.values.proyectoUID = uid;
  }
  static getListProy() {
    return this.values.list_proyectoUID;
  }

  static setListProy(uid) {
    this.values.list_proyectoUID = uid;
  }

  static getRefresh() {
    return this.values.refresh;
  }

  static getEmpresaUID() {
    return this.values.empresaUID;
  }

  static setEmpleadoName(empleadoData) {
    this.values.empleadoName = empleadoData.Nombre;
  }

  static setPermisos(empleadoData) {
    if (empleadoData.Permisos == 1 || empleadoData.Permisos == "1") {
      this.values.permisos = false;
    }
    else {
      this.values.permisos = true;
    }
  }

  static getPermisos() {
    return this.values.permisos;
  }

  static setLogged() {
    this.values.logged = false;
  }

  static getLogged() {
    return this.values.logged;
  }

  static getEmpleadoName() {
    return this.values.empleadoName;
  }

  static setEmpleadoId(empleadoData) {
    this.values.empleadoID = empleadoData.Id;
  }

  static setProyectoUID(proyectoUID) {
    this.values.work_proyectoUID = proyectoUID;
    console.log("valor uid project", this.values.work_proyectoUID);
  }

  static getProyectoUID() {
    return this.values.work_proyectoUID;
  }

  static setWorkProyecto(work_proyecto) {
    this.values.work_proyectoUID = work_proyecto.id;
    this.values.work_proyectoName = work_proyecto.name;
    console.log("valor uid project", this.values.work_proyectoUID);
    console.log("valor name project", this.values.work_proyectoName);
  }

  static setWorkProyectoName(work_proyecto) {
    this.values.work_proyectoName = work_proyecto;
  }

  static getWorkProyecto(type) {
    if (type == true) {
      return this.values.work_proyectoUID;
    }
    else {
      return this.values.work_proyectoName;
    }
  }

  static setEmpresaUID(empresaUID_) {
    this.values.empresaUID = empresaUID_;
    console.log(this.values.empresaUID)
  }

  static setOtroValor(otroValor) {
    this.values.otroValor = otroValor;
  }

  static setRefresh() {
    this.values.refresh = !this.values.refresh;
  }

  static getOtroValor() {
    return this.values.otroValor;
  }

  // Puedes agregar más métodos para otros valores globales aquí
}

export default GlobalValues;
