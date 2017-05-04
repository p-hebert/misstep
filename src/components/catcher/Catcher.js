import ResponseError from '../errors/ResponseError';

function response(res){
  return function(err){
    console.error(err);
    if(err instanceof ResponseError){
      res.status(err.status).json({
        status: err.status,
        type: err.type,
        message: err.message,
        payload: err.payload,
      });
    }else{
      if(typeof err === "object" && err){
        res.status(500).json({
          status: err.status || 500,
          type: "RESPONSE:DEFAULT:ERROR",
          payload: err
        });
      }else{
        res.status(500).json({
          status: 500,
          type: "RESPONSE:DEFAULT:ERROR",
          payload: err
        });
      }
    }
  };
}

const Catcher = {
  response: response
};

export default Catcher;
