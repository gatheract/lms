import {useState} from 'react';

const useFormResettable = (initialValues, callback) => {
  const [inputs, setInputs] = useState(initialValues);
  const handleSubmit = (event) => {
    if (event) event.preventDefault();
      callback();
  }
  const handleInputChange = (event) => {
    event.persist();
    setInputs(inputs => ({...inputs, [event.target.id]: event.target.value}));
  }
  const reset = (obj) => {
    console.log(inputs);
    //console.log(obj);
    //setInputs(obj);
  }
  return {
    reset,
    handleSubmit,
    handleInputChange,
    inputs
  };
}
export default useFormResettable;
