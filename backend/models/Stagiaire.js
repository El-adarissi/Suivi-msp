
class Stagiaire {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM stagiaires');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM stagiaires WHERE Id_Stagiaire = ?', [id]);
    return rows[0];
  }

  static async createAcc({ NomStag, PrenomStag, Filiere, Id_Superviseur, Id_Etablissement, Password, Email }) {
    const [result] = await db.query(
      `INSERT INTO stagiaires (NomStag, PrenomStag, Filiere, Id_Superviseur, Id_Etablissement, Password, Email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [NomStag, PrenomStag, Filiere, Id_Superviseur, Id_Etablissement, Password, Email]
    );
    return result.insertId;
  }

  static async requestTransfer(id, newEtablissementId) {
    const [result] = await db.query(
      'UPDATE stagiaires SET Id_Etablissement = ? WHERE Id_Stagiaire = ?',
      [newEtablissementId, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM stagiaires WHERE Id_Stagiaire = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Stagiaire;