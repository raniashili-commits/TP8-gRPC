const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const movieProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('movie.proto', { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
).movie;

// Base de données fictive en mémoire
let movies = [
  { id: '1', title: 'Exemple de film 1', description: 'Premier exemple.' },
  { id: '2', title: 'Exemple de film 2', description: 'Deuxième exemple.' },
];

const movieService = {
  getMovie: (call, callback) => {
    const movie = movies.find(m => m.id === call.request.movie_id);
    if (movie) callback(null, { movie });
    else callback({ code: grpc.status.NOT_FOUND, message: 'Film non trouvé' });
  },

  searchMovies: (call, callback) => {
    callback(null, { movies });
  },

  createMovie: (call, callback) => {
    const newMovie = {
      id: String(movies.length + 1),
      title: call.request.title,
      description: call.request.description,
    };
    movies.push(newMovie);
    callback(null, { movie: newMovie });
  },

  updateMovie: (call, callback) => {
    const index = movies.findIndex(m => m.id === call.request.movie_id);
    if (index === -1) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Film non trouvé' });
    } else {
      movies[index] = {
        id: call.request.movie_id,
        title: call.request.title,
        description: call.request.description,
      };
      callback(null, { movie: movies[index] });
    }
  },

  deleteMovie: (call, callback) => {
    const index = movies.findIndex(m => m.id === call.request.movie_id);
    if (index === -1) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Film non trouvé' });
    } else {
      movies.splice(index, 1);
      callback(null, { message: 'Film supprimé avec succès' });
    }
  },
};

const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) { console.error('Erreur:', err); return; }
  console.log(`Microservice Films en cours sur le port ${port}`);
});