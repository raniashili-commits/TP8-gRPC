const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const tvShowProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('tvShow.proto', { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
).tvShow;

let tvShows = [
  { id: '1', title: 'Exemple de série TV 1', description: 'Premier exemple.' },
  { id: '2', title: 'Exemple de série TV 2', description: 'Deuxième exemple.' },
];

const tvShowService = {
  getTvshow: (call, callback) => {
    const tv_show = tvShows.find(t => t.id === call.request.tv_show_id);
    if (tv_show) callback(null, { tv_show });
    else callback({ code: grpc.status.NOT_FOUND, message: 'Série non trouvée' });
  },

  searchTvshows: (call, callback) => {
    callback(null, { tv_shows: tvShows });
  },

  createTvshow: (call, callback) => {
    const newShow = {
      id: String(tvShows.length + 1),
      title: call.request.title,
      description: call.request.description,
    };
    tvShows.push(newShow);
    callback(null, { tv_show: newShow });
  },

  updateTvshow: (call, callback) => {
    const index = tvShows.findIndex(t => t.id === call.request.tv_show_id);
    if (index === -1) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Série non trouvée' });
    } else {
      tvShows[index] = {
        id: call.request.tv_show_id,
        title: call.request.title,
        description: call.request.description,
      };
      callback(null, { tv_show: tvShows[index] });
    }
  },

  deleteTvshow: (call, callback) => {
    const index = tvShows.findIndex(t => t.id === call.request.tv_show_id);
    if (index === -1) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Série non trouvée' });
    } else {
      tvShows.splice(index, 1);
      callback(null, { message: 'Série supprimée avec succès' });
    }
  },
};

const server = new grpc.Server();
server.addService(tvShowProto.TVShowService.service, tvShowService);

server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) { console.error('Erreur:', err); return; }
  console.log(`Microservice Séries TV en cours sur le port ${port}`);
});