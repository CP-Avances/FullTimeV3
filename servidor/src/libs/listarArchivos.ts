import fs from 'fs'
import path from 'path'

export const listaCarpetas = function(nombre_carpeta: string) {

    const ruta = path.resolve(nombre_carpeta) 
    
    let Lista_Archivos: any = fs.readdirSync(ruta);
    // console.log(Lista_Archivos);
    
    return Lista_Archivos.map((obj:any) => {
        return {
            file: obj,
            extencion: obj.split('.')[1]
        }
    })
}

export const DescargarArchivo = function(dir: string, filename: string) {
    const ruta = path.resolve(dir);
    return ruta + '\\' + filename
}