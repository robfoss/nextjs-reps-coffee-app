import React, {useContext, useEffect, useState} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

import useSWR from 'swr';

import { fetchCoffeeStores } from '../../lib/coffee-stores';
import { StoreContext } from '../../store/store-context';
import {isEmpty, fetcher} from '../../utils'

import styles from '../../styles/coffee-store.module.css'

export async function getStaticProps(staticProps) {
  const params = staticProps.params;
 
  const coffeeStores = await fetchCoffeeStores();
  const coffeeStoreFromContext = coffeeStores.find(coffeeStore => {
        return coffeeStore.id === params.id.toString();
      })


  return {
    props: {
      coffeeStore: coffeeStoreFromContext ? coffeeStoreFromContext : {}
    }, // will be passed to the page component as props
  }
}

export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores();
  const paths = coffeeStores.map(coffeeStore => {
    return {
      params: {
        id: coffeeStore.id
      }
    }
  })
  return {
    paths,
    fallback: true
  }
}


const CoffeeStore = (initialProps) => {
  const router = useRouter()
  const id = router.query.id;

  const[coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore || {})
   const [votingCount, setVotingCount] = useState(0);

  const {
    state: {
      coffeeStores
    }
  } = useContext(StoreContext);

  const handleCreateCoffeeStore = async (coffeeStore) => {
    try {
      const {
        id, name, voting, imgUrl, address, neighbourhood
      } = coffeeStore;

      const response = await fetch('/api/createCoffeeStore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
         id,
         name, 
         voting: 0, 
         imgUrl, 
         neighbourhood: neighbourhood.length > 0 ? neighbourhood[0] : null || "",
         address: address || "", 
        }),
      });
      const dbCoffeeStore = response.json()
      
    } catch (error) {
      console.error("Error creating coffee store",error)
    }
  }

  useEffect(() => {
    if (isEmpty(initialProps.coffeeStore)){
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find(coffeeStore => {
        return coffeeStore.id === id.toString();
      })
        if (coffeeStoreFromContext){
          setCoffeeStore(coffeeStoreFromContext)
          handleCreateCoffeeStore(coffeeStoreFromContext)
        }
      }
    } else {
      handleCreateCoffeeStore(initialProps.coffeeStore)
    }
  }, [id, initialProps, initialProps.coffeeStore])

  const {address, name, imgUrl, voting, neighbourhood} = coffeeStore;

  
  const { data, error } = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher);

  useEffect(() => {
    if (data && data.length > 0){
      setCoffeeStore(data[0])
      setVotingCount(data[0].voting)
    }
  }, [data]);

  if (error) {
    console.error(error)
    return <div>Something went wrong retrieving coffee store page!</div>
  }
  

  if(router.isFallback){
    
    return <div>Loading...</div>
  };


  const handleUpvoteButton = async () => {
    try {
      const response = await fetch('/api/favoriteCoffeeStoreById', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
         id
        }),
      });
      const dbCoffeeStore = response.json();
      if (dbCoffeeStore && dbCoffeeStore.length > 0) {
        let count = votingCount + 1;
        setVotingCount(count)
      }
      
      
    } catch (error) {
      console.error("Error upvoting the coffee store",error)
    }
    
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href='/'>
              <a>← Back to home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image src={imgUrl || "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"} width={600} height={360} className={styles.storeImg} alt={name}/>
        </div>
        <div className={`glass ${styles.col2}`}>
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/places.svg" width="24" height="24"/>
            <p className={styles.text}>{address}</p>
          </div>
          {
            neighbourhood && (
              <div className={styles.iconWrapper}>
                <Image src="/static/icons/nearMe.svg" width="24" height="24"/>
                <p className={styles.text}>{neighbourhood}</p>
              </div>
            )
          }
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/star.svg" width="24" height="24"/>
            <p className={styles.text}>{votingCount}</p>
          </div>
          <button 
            className={styles.upvoteButton} 
            onClick={handleUpvoteButton}
            >
              Up vote!
            </button>
        </div>
      </div>
    </div>
    
  )
}

export default CoffeeStore