import { httpURL } from "./config";

export default{

    getlisteditors: () => {
        return httpURL.get('editoras')
    },
    getuniqueeditor: (ideditor) => {
        console.log(ideditor) 
        return httpURL.get(`editora/${ideditor}`)
    },
    puteditorupdate: (editor) => {
        console.log(editor) 
        return httpURL.put('editora', editor)
    },
    postaddeditor: (editor) => {
        console.log(editor)
        return httpURL.post('editora', editor)
    },
    deleteeditor: (editor) => {
        console.log(editor)
        return httpURL.delete('editora', {data: editor})
    }
}