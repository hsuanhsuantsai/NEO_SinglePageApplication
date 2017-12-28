class NEOsApp extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			data: null,
			slider: 0,
			hazardousOnly: false,
		};
		this.pullData();
	}

	sliderChange = (event) => {
		this.setState({ slider: event.target.value });
	}

	hazardousChange = (event) => {
		this.setState({ hazardousOnly: !this.state.hazardousOnly });
	}

	pullData = () => {
		const key = 'f1VKtqW4kiTxsBCIxCGUFdHVQskbuZsoraWX80Mp'
		const today = new Date()
		const nasa_url = 'https://api.nasa.gov/neo/rest/v1/feed?start_date=' + today.toISOString().slice(0, 10) + '&api_key=' + key;
		fetch(nasa_url).then(this.parseResponse).then(this.showNEOs);
	}

	parseResponse = (response) => { return response.json(); }

	showNEOs = (data) => {
		console.log(data)
		// console.debug(data.element_count)
		if (data.element_count > 0) {
			let neos = [];
			const dateArray = Object.keys(data.near_earth_objects)
			dateArray.forEach( date => {
				const obj = data.near_earth_objects[date]
				// console.log(data.near_earth_objects)
				// console.log(obj)
				if (obj.length > 0) {
					obj.forEach(function(element) {
					    // console.log(element);
					    neos.push(element);
					});
				}
			})
			// console.debug(neos.length)
			console.debug(neos)
			this.setState({ data: neos })
		}
		else {
			this.setState({ data: null })
		}
	}

	render() {
		return(
			<div>
				<div className="row">
			        <div className="col-sm-12">
			          <h1>Near-Earth Object Radar</h1>
			        </div>
			    </div>
			    <div className="row">

			          <div className="col-sm-12">

			            <form className="form-row">
				            
			              	<div className="form-check">
				                <label className="form-check-label">
				                  <input className="form-check-input" type="checkbox" onChange={this.hazardousChange} value={this.state.hazardousOnly} />
				                  Hazardous objects only
				                </label>
							</div>

			              	<div className="form-group  mx-auto">
			                	<input id="test" step="1000" type="range" onChange={this.sliderChange} value={this.state.slider} min="0" max="60000"/>
			                	<label id="speed">Minimum Speed: <span>{ this.state.slider }</span> mph</label>
			              	</div>
			            </form>
			          </div>
			    </div>

			    <div className="row">
			    	<div className="col-sm-12 mt-3">
			          {this.state.data && <NEOsTable speed={this.state.slider} hazardousOnly={this.state.hazardousOnly} neos={this.state.data} />}
			        </div>
			    </div>
			</div>
		);
	}
}

function NEOsTable(props) {
	const speed = props.speed;
	const hazardousOnly = props.hazardousOnly;

	const rows = [];
	if (props.neos.length > 0) {
			props.neos.forEach( (neo) => {
				if ((hazardousOnly && !neo.is_potentially_hazardous_asteroid) 
					|| (speed > neo.close_approach_data[0].relative_velocity.miles_per_hour)) {

					return;
				}
			    
			rows.push(
			    <NeoRow 
			    	key={neo.name} 
			    	date={neo.close_approach_data[0].close_approach_date} 
			        isHazardous={neo.is_potentially_hazardous_asteroid} 
			        velocity={neo.close_approach_data[0].relative_velocity.miles_per_hour} 
			        diameter={neo.estimated_diameter.feet.estimated_diameter_max} 
			        hazardousOnly={hazardousOnly}
			    />
			);
		});
	}

	return	(
		<div>
			<h3 className="text-secondary mb-3"><span>{ rows.length }</span> objects found.</h3>
			<table className="table table-responsive table-striped">
			    <thead className="thead-inverse">
			        <tr>
				      <th>Approach Date</th>
				      <th>Hazardous?</th>
				      <th>Speed (mph)</th>
				      <th>Max. Diameter (feet)</th>
			        </tr>
			    </thead>
				<tbody>
			      	{ rows }
			    </tbody>
			</table>
		</div>
	)
}

function NeoRow(props) {
	let color = 'black'
	if (!props.hazardousOnly && props.isHazardous) {
		color = 'red'
	}
	return (
		<tr style={{color: color}}>
		  <td>{ props.date }</td>
		  <td>{ (props.isHazardous && "Yes") || "No" }</td>
		  <td>{ props.velocity }</td>
		  <td>{ props.diameter }</td>
		</tr>
	)
}

ReactDOM.render(
  <NEOsApp />,
  document.getElementById('root')
);