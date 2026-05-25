package checkchow.back.config;

import checkchow.back.admision.repository.ClaveRespuestaRepository;
import checkchow.back.admision.repository.ProcesoAdmisionRepository;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;
import checkchow.back.user.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DatosExistentesInitializer implements CommandLineRunner {

    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final ClaveRespuestaRepository claveRespuestaRepository;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @Override
    @Transactional
    public void run(String... args) {
        if (procesoAdmisionRepository.findByCreadoPorIsNull().isEmpty()
                && claveRespuestaRepository.findByCreadoPorIsNull().isEmpty()) {
            return;
        }

        Usuario usuarioSistema = usuarioAutenticadoService.obtenerUsuarioSistemaParaDatosExistentes();

        procesoAdmisionRepository.findByCreadoPorIsNull()
                .forEach(proceso -> proceso.setCreadoPor(usuarioSistema));

        claveRespuestaRepository.findByCreadoPorIsNull()
                .forEach(clave -> clave.setCreadoPor(usuarioSistema));
    }
}
