import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Hero from './Hero'
import Category from './Category'
import Search from '../../components/Search/Search'
export default function StockImage() {
  return (
    <>
      <Navbar />
      <Search />
      <Hero />
      <Category />
    </>
  )
}
