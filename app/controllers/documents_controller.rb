# frozen_string_literal: true

class DocumentsController < ApplicationController
  def new
    @document = Document.create

    redirect_to document_path(@document.name)
  end

  def show
    @document = Document.find_by!(name: params[:id])

    respond_to do |format|
      format.html
      format.json { render json: @document }
    end
  end
end
