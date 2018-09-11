import React,{Component} from 'react';


class Searchbar extends Component{
  render(){
    return(
      <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{display:this.props.searchDis}}>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navSearch" aria-controls="navSearch" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navSearch">
          <a className="nav-link" onClick={this.props.changeToHome} style={{color:'black'}}>Home <span className="sr-only">(current)</span></a>
          <div className="form-inline my-2 my-lg-0">
            <input classNameclassName="form-control mr-sm-2 "  onChange={this.props.changeSearchInput} value={this.props.searchInput} type="search" placeholder={this.props.searchCategory} aria-label={this.props.searchCategory}/>
            <button className="btn btn-outline-success my-2 my-sm-0" onClick={this.props.doSearch}>Search</button>
          </div>
        </div>
      </nav>
    );
  }
}
export default Searchbar;
