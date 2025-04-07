package com.camyo.backend.empresa;

import java.util.List;
import java.util.Optional;

import com.camyo.backend.exceptions.ResourceNotFoundException;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmpresaService {

    private EmpresaRepository empresaRepository;

    @Autowired
	public EmpresaService(EmpresaRepository empresaRepository) {
		this.empresaRepository = empresaRepository;
	}


    @Transactional(readOnly = true)
    public List<Empresa> obtenerTodasEmpresas() throws DataAccessException {
        return empresaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Empresa obtenerEmpresaPorId(int id) throws DataAccessException {
        return empresaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Empresa", "ID", id));
    }

    @Transactional(readOnly = true)
	public Optional<Empresa> obtenerEmpresaPorUsuario(int usuarioId) throws DataAccessException {
		return empresaRepository.obtenerPorUsuario(usuarioId);
	}

	@Transactional(readOnly = true)
	public Optional<Empresa> obtenerEmpresaPorNif(String nif) throws DataAccessException {
		return empresaRepository.obtenerPorNif(nif);
	}

    @Transactional
    public Empresa guardarEmpresa(Empresa empresa) throws DataAccessException {
        empresaRepository.save(empresa);
        return empresa;
    }

	public Empresa actualizarEmpresa(Empresa empresa, int id) throws DataAccessException {
		Empresa toUpdate = obtenerEmpresaPorId(id);
		BeanUtils.copyProperties(empresa, toUpdate, "id", "usuario");
		return guardarEmpresa(toUpdate);
	}

	@Transactional
	public void eliminarEmpresa(int id) throws DataAccessException {
		Empresa toDelete = obtenerEmpresaPorId(id);
		empresaRepository.delete(toDelete);
	}
}
