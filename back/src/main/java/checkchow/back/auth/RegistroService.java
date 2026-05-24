package checkchow.back.auth;

import checkchow.back.auth.dto.AuthRegisterRequest;
import checkchow.back.auth.dto.AuthRegisterResponse;
import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.enums.TRol;
import checkchow.back.seguridad.entity.Sesion;
import checkchow.back.seguridad.service.AuditoriaService;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class RegistroService {

    private final UsuarioService usuarioService;
    private final AuditoriaService auditoriaService;

    @Transactional
    public AuthRegisterResponse registrarCliente(AuthRegisterRequest request) {
        return registrarCliente(request, null);
    }

    @Transactional
    public AuthRegisterResponse registrarCliente(AuthRegisterRequest request, HttpServletRequest httpRequest) {
        // Validar si el correo ya existe
        if (usuarioService.getCorreo(request.getEmail().trim().toLowerCase()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya está registrado");
        }


        // Crear usuario
        Usuario usuario = new Usuario();
        usuario.setNombre_completo(request.getNombre_completo());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setRol(TRol.ADMIN);
        Usuario usuarioCreado = usuarioService.CreateUsuario(usuario);

        Sesion sesion = auditoriaService.registrarSesion(usuarioCreado, "REGISTRO-" + UUID.randomUUID(), httpRequest);
        auditoriaService.registrarEvento(usuarioCreado, sesion, TAccion.CREATE, TMetodoHttp.POST,
                "/api/auth/register", "usuario", String.valueOf(usuarioCreado.getId()),
                "{\"accion\":\"USUARIO_REGISTRADO\"}", httpRequest);


        // Aqui mapea a response
        return mapToResponse(usuarioCreado);
    }

    private AuthRegisterResponse mapToResponse(Usuario usuario) {
        AuthRegisterResponse response = new AuthRegisterResponse();
        response.setId(usuario.getId());
        response.setNombre_completo(usuario.getNombre_completo());
        response.setEmail(usuario.getEmail());
        response.setCreatedAt(usuario.getFechaCreacion());
        return response;
    }
}
