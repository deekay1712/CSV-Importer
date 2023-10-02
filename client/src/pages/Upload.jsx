import React, { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'
import Select from "react-tailwindcss-select";

export default function Upload() {
    const [file, setFile] = useState('')
    const [sheetUrl, setSheetUrl] = useState('')
    const [sheetName, setSheetName] = useState('')
    const [seperator, setSeperator] = useState(',')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [columns, setColumns] = useState([])
    const [headers, setHeaders] = useState([])
    const [receivedColumns, setReceivedColumns] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('sheetUrl', sheetUrl)
        formData.append('sheetName', sheetName)
        formData.append('seperator', seperator)
        formData.append('headers', headers)
        const response = await axios.post('http://localhost:5000/upload', formData)
        
        if (response.status === 200) {
            window.location.reload()
        }
    }

    const getColumns = async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('seperator', seperator)
        const response = await axios.post(`http://localhost:5000/getColumns`, formData)
        setColumns(response.data.columns)
        setReceivedColumns(true)
    }

    const addColumnToHeaders = (column, index) => {
        setHeaders(prev => [...prev, column])
        setColumns(prev => prev.filter((_, i) => i !== index))
    }

    const removeElementFromHeaders = (index, column) => {
        setHeaders(prev => prev.filter((_, i) => i !== index))
        setColumns(prev => [...prev, column])
    }

    useEffect(() => {
        if(file) {
            getColumns()
        }else{
            setReceivedColumns(false)
            setSeperator(',')
        }
        // reset all other states
        setHeaders([])
        setColumns([])
        setSheetUrl('')
        setSheetName('')
    }, [file])

    

    return (
        <div className='container mx-auto text-white bg-gray-900 bg-opacity-50 p-10 rounded-md'>
            <div className='mb-5'>
                <h1 className='text-xl'>Instructions:</h1>
                <p className='text-sm '>Share you Google Sheet with the <span className='font-bold'>csv-importer@csv-importer-400617.iam.gserviceaccount.com</span> with all the permissions and fill the below form.</p>
            </div>
            <form className='flex flex-col' onSubmit={handleSubmit}>
                <label className='mt-3'>Seperator</label>
                <select className=' text-black' onChange={(e) => setSeperator(e.target.value)}>
                    <option value={','}>Comma (,)</option>
                    <option value={';'}>Semicolon (;)</option>
                </select>
                <label className='mt-3'>Upload CSV</label>
                <input type="file" required onChange={(e) => setFile(e.target.files[0])} className='text-gray-600' accept=".csv" />
                {
                    receivedColumns &&
                    <>
                        <label className='mt-3'>Choose Columns:</label>
                        {
                            headers.length>0 &&
                            <div className='bg-white text-black flex p-2 space-x-2 flex-wrap mb-2'>
                            {
                                headers.map((column, index) => {
                                    return (
                                        <span key={index} className='my-1 cursor-pointer bg-green-200 px-2 py-1 rounded-sm hover:bg-red-200 w-max' onClick={() => removeElementFromHeaders(index, column)}>
                                            {column}
                                        </span>
                                    )
                                })
                            }
                            </div>
                        }
                        {
                            columns.length>0 &&
                            <div className='bg-white text-black flex p-2 space-x-2 flex-wrap'>
                            {
                                columns.map((column, index) => {
                                    return (
                                        <span key={index} className='my-1 cursor-pointer bg-red-200 px-2 py-1 rounded-sm hover:bg-green-200' onClick={() => addColumnToHeaders(column, index)}>
                                            {column}
                                        </span>
                                    )
                                })
                            }
                        </div>
                        }
                        <label className='mt-3'>Sheet URL</label>
                        <input type="text" required onChange={(e) => setSheetUrl(e.target.value)} className='text-black' />
                        <label className='mt-3'>Sheet Name</label>
                        <input type="text" required onChange={(e) => setSheetName(e.target.value)} className='text-black' />
                       
                        {isSubmitting?  
                        <input type="submit" className='mt-3 w-1/3 self-center cursor-not-allowed bg-gray-800 text-white font-bold py-2' disabled={true}/>:
                        <input type="submit" className='mt-3 w-1/3 self-center cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-bold py-2'/>}
                    </>
                }
            </form>
        </div>
  )
}
