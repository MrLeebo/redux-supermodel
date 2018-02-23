import React from 'react'
import { Route } from 'react-router-dom'

import Navbar from './Navbar'
import ContactDetailPage from './ContactDetailPage'
import ContactListPage from './ContactListPage'

export default function App() {
  return (
    <div className='App'>
      <Navbar />

      <div className='container'>
        <Route path='/' exact component={ContactListPage} />
        <Route path='/contacts/:id' component={ContactDetailPage} />
        <Route path='/contacts' exact component={ContactListPage} />
      </div>
    </div>
  )
}
