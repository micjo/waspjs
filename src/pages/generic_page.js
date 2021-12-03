import {useData, useModal} from "../components/generic_control";
import {sendRequest} from "../http_helper";


export function useGenericPage(url, title) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, {"loggers": {}})

    let config = {
        title: title, url: url, running:running, data: data, popup: (message) => cb(message),
        setData: (data) => setData(data),
        send: async(request) => await sendRequest(url, request, cb, setData)
    }
    return [config, show, setShow, modalMessage]
}