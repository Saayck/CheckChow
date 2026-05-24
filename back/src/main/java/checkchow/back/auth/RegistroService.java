package checkchow.back.auth;

import checkchow.back.auth.dto.AuthRegisterRequest;
import checkchow.back.auth.dto.AuthRegisterResponse;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class RegistroService {

    private final UsuarioService usuarioService;

    @Transactional
    public AuthRegisterResponse registrarCliente(AuthRegisterRequest request) {
        // Validar si el correo ya existe
        if (usuarioService.getCorreo(request.getEmail().toUpperCase()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya está registrado");
        }


        // Crear usuario
        Usuario usuario = new Usuario();
        usuario.setNombre_completo(request.getNombre_completo());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        Usuario usuarioCreado = usuarioService.CreateUsuario(usuario);


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
