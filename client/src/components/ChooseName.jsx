import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

const ChooseName = () => {
  const [userName, setUserName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nav = useNavigate();

  const id = params.get('Id');
  const email = params.get('email');
  const googleName = params.get('googleName');

  useEffect(() => {
    handleDisplayTextChange(googleName.replace(/ /g, '_'));
  },[googleName])

  const handleUserTextChange = (userNameText) => {
    if (userNameText.length < 20 && /^[A-Za-z0-9_.]+$/.test(userNameText)) {
        setUserName(userNameText);
    } else if (userNameText.length === 0) {
        setUserName('');
    }
  }

  const handleDisplayTextChange = (displayNameText) => {
    if (displayNameText.length < 20 && /^[\w.-À-ÖØ-öø-ÿ]+$/u.test(displayNameText)) {
      setDisplayName(displayNameText);
    } else if (displayNameText.length === 0) {
      setDisplayName('');
    }
  }

  const sumbitForm = async (event) => {
    event.preventDefault();

    await fetch('/api/createName', {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        email: email,
        username: userName, 
        displayName: displayName,
      })
    })
    .then((response) => {
      console.log(response.statusText);
      if (String(response.statusText) === 'OK') {
        setTimeout(() => {
          nav('/', { replace: true })
        }, 300)
      }
    })
  
    setUserName('');
    setDisplayName('');
  }

  return (
    <form onSubmit={sumbitForm}>
      <p>Email: {email}</p>
      <label htmlFor='userName'>
        Set Username (Case Sensitive)
        <br/>
        This will be your unique username, shown on your profile as '/user/{userName}'
        <br/>
        This cannot be changed later*
      </label>
      <br/>
      <input type='text' id='userName' value={userName} onChange={(e) => {handleUserTextChange(e.target.value)}}></input>
      <br/>
      <br/>
      <label htmlFor='displayName'>
        Set Display Name
        <br/>
        This will be your display name, shown on your profile as '@{displayName}'
        <br/>
        This can be changed at any time later
      </label>
      <br/>
      <input type='text' id='displayName' value={displayName} onChange={(e) => {handleDisplayTextChange(e.target.value)}}></input>
      <br/>
      <input type='submit'></input>
    </form>
  )
}
  
export default ChooseName