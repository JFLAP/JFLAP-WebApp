import React from 'react';

import Footer from "./Footer";
import Header from "./Header";

class Homepage extends React.Component{

    constructor(props){
        super(props)

    }

    render() {

        return (

            <div className="container">
                <Header/>
                <Footer/>
            </div>

        );

    }

}

export default Homepage;