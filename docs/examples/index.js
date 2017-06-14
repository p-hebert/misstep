const misstep = require('./misstep');

Promise.resolve(null)
  .then(review)
  .then(commit)
  .catch(misstep.catcher({ type: 'barebone', options: {throw: true} }));


function review(data) {
  if(data){
    return Promise.resolve(data.info);
  }else{
    return Promise.reject(
      misstep.builder({type: 'ECMASCRIPT:BUILTIN:TYPE_ERROR', message: 'should be truthy', payload: data})
    );
  }
}

function commit(data) {
  return Promise.resolve(data);
}
